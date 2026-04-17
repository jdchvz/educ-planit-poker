/**
 * Redis persistence layer with graceful fallback to in-memory storage
 */

import Redis from 'ioredis'
import type { CardValue, RoomMeta } from '../../types/room'

const ROOM_TTL = 24 * 60 * 60 // 24 hours in seconds

let redis: Redis | null = null
let useRedis = false

// In-memory fallback storage
const memoryStore = {
  players: new Map<string, Set<string>>(),
  votes: new Map<string, Map<string, CardValue>>(),
  meta: new Map<string, RoomMeta>(),
}

/**
 * Initialize Redis client with connection retry and graceful fallback
 */
export function initRedis() {
  const redisUrl = process.env.REDIS_URL || process.env.NUXT_REDIS_URL

  if (!redisUrl) {
    console.log('[Redis] No REDIS_URL found, using in-memory storage')
    return
  }

  try {
    redis = new Redis(redisUrl, {
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn('[Redis] Max retry attempts reached, falling back to in-memory storage')
          useRedis = false
          return null // Stop retrying
        }
        return Math.min(times * 100, 3000)
      },
      maxRetriesPerRequest: 3,
    })

    redis.on('connect', () => {
      console.log('[Redis] Connected successfully')
      useRedis = true
    })

    redis.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message)
      useRedis = false
    })

    redis.on('close', () => {
      console.warn('[Redis] Connection closed, falling back to in-memory storage')
      useRedis = false
    })
  } catch (error) {
    console.error('[Redis] Initialization failed:', error)
    redis = null
    useRedis = false
  }
}

/**
 * Room data access layer - works with both Redis and in-memory storage
 */
export const roomStore = {
  /**
   * Add a player to a room
   */
  async addPlayer(roomId: string, playerName: string): Promise<void> {
    if (useRedis && redis) {
      await redis.sadd(`room:${roomId}:players`, playerName)
      await redis.expire(`room:${roomId}:players`, ROOM_TTL)
    } else {
      if (!memoryStore.players.has(roomId)) {
        memoryStore.players.set(roomId, new Set())
      }
      memoryStore.players.get(roomId)!.add(playerName)
    }
  },

  /**
   * Remove a player from a room
   */
  async removePlayer(roomId: string, playerName: string): Promise<void> {
    if (useRedis && redis) {
      await redis.srem(`room:${roomId}:players`, playerName)
    } else {
      memoryStore.players.get(roomId)?.delete(playerName)
    }
  },

  /**
   * Get all players in a room
   */
  async getPlayers(roomId: string): Promise<string[]> {
    if (useRedis && redis) {
      return await redis.smembers(`room:${roomId}:players`)
    } else {
      const players = memoryStore.players.get(roomId)
      return players ? Array.from(players) : []
    }
  },

  /**
   * Check if a player exists in a room
   */
  async hasPlayer(roomId: string, playerName: string): Promise<boolean> {
    if (useRedis && redis) {
      return (await redis.sismember(`room:${roomId}:players`, playerName)) === 1
    } else {
      return memoryStore.players.get(roomId)?.has(playerName) ?? false
    }
  },

  /**
   * Set a player's vote
   */
  async setVote(roomId: string, playerName: string, card: CardValue): Promise<void> {
    if (useRedis && redis) {
      await redis.hset(`room:${roomId}:votes`, playerName, JSON.stringify(card))
      await redis.expire(`room:${roomId}:votes`, ROOM_TTL)
    } else {
      if (!memoryStore.votes.has(roomId)) {
        memoryStore.votes.set(roomId, new Map())
      }
      memoryStore.votes.get(roomId)!.set(playerName, card)
    }
  },

  /**
   * Get a player's vote
   */
  async getVote(roomId: string, playerName: string): Promise<CardValue | null> {
    if (useRedis && redis) {
      const vote = await redis.hget(`room:${roomId}:votes`, playerName)
      return vote ? JSON.parse(vote) : null
    } else {
      return memoryStore.votes.get(roomId)?.get(playerName) ?? null
    }
  },

  /**
   * Get all votes for a room
   */
  async getAllVotes(roomId: string): Promise<Map<string, CardValue>> {
    if (useRedis && redis) {
      const votesObj = await redis.hgetall(`room:${roomId}:votes`)
      const votes = new Map<string, CardValue>()
      for (const [player, voteStr] of Object.entries(votesObj)) {
        votes.set(player, JSON.parse(voteStr))
      }
      return votes
    } else {
      return memoryStore.votes.get(roomId) ?? new Map()
    }
  },

  /**
   * Remove a player's vote
   */
  async removeVote(roomId: string, playerName: string): Promise<void> {
    if (useRedis && redis) {
      await redis.hdel(`room:${roomId}:votes`, playerName)
    } else {
      memoryStore.votes.get(roomId)?.delete(playerName)
    }
  },

  /**
   * Clear all votes for a room
   */
  async clearVotes(roomId: string): Promise<void> {
    if (useRedis && redis) {
      await redis.del(`room:${roomId}:votes`)
    } else {
      memoryStore.votes.set(roomId, new Map())
    }
  },

  /**
   * Set room metadata
   */
  async setMeta(roomId: string, meta: RoomMeta): Promise<void> {
    if (useRedis && redis) {
      await redis.hset(`room:${roomId}:meta`, {
        deck: JSON.stringify(meta.deck),
        creator: meta.creator,
        revealed: meta.revealed ? '1' : '0',
        roundId: meta.roundId,
      })
      await redis.expire(`room:${roomId}:meta`, ROOM_TTL)
    } else {
      memoryStore.meta.set(roomId, meta)
    }
  },

  /**
   * Get room metadata
   */
  async getMeta(roomId: string): Promise<RoomMeta | null> {
    if (useRedis && redis) {
      const metaObj = await redis.hgetall(`room:${roomId}:meta`)
      if (!metaObj || Object.keys(metaObj).length === 0) return null

      return {
        deck: JSON.parse(metaObj.deck || '[]'),
        creator: metaObj.creator || '',
        revealed: metaObj.revealed === '1',
        roundId: metaObj.roundId || '',
      }
    } else {
      return memoryStore.meta.get(roomId) ?? null
    }
  },

  /**
   * Update specific metadata fields
   */
  async updateMeta(roomId: string, updates: Partial<RoomMeta>): Promise<void> {
    const meta = await this.getMeta(roomId)
    if (!meta) return

    const updated: RoomMeta = { ...meta, ...updates }
    await this.setMeta(roomId, updated)
  },

  /**
   * Check if a room exists
   */
  async roomExists(roomId: string): Promise<boolean> {
    if (useRedis && redis) {
      const exists = await redis.exists(`room:${roomId}:meta`)
      return exists === 1
    } else {
      return memoryStore.meta.has(roomId)
    }
  },

  /**
   * Delete entire room
   */
  async deleteRoom(roomId: string): Promise<void> {
    if (useRedis && redis) {
      await redis.del(
        `room:${roomId}:players`,
        `room:${roomId}:votes`,
        `room:${roomId}:meta`
      )
    } else {
      memoryStore.players.delete(roomId)
      memoryStore.votes.delete(roomId)
      memoryStore.meta.delete(roomId)
    }
  },

  /**
   * Get player count for a room
   */
  async getPlayerCount(roomId: string): Promise<number> {
    if (useRedis && redis) {
      return await redis.scard(`room:${roomId}:players`)
    } else {
      return memoryStore.players.get(roomId)?.size ?? 0
    }
  },
}

// Initialize on import
initRedis()
