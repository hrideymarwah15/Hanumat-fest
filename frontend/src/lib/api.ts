
import { getSession } from './supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type RequestConfig = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>
}

export const api = {
  async get<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const session = await getSession()
    
    let url = `${API_URL}${endpoint}`
    if (config.params) {
      const searchParams = new URLSearchParams()
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
      url += `?${searchParams.toString()}`
    }

    const headers = new Headers(config.headers)
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`)
    } else {
      headers.set('Authorization', `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`)
    }

    const res = await fetch(url, {
      ...config,
      headers,
    })

    const data = await res.json()
    
    if (!res.ok) {
        throw { 
            status: res.status, 
            message: data.error || data.message || 'An error occurred',
            code: data.code
        }
    }

    return data.data !== undefined ? data.data : data
  },

  async post<T>(endpoint: string, body: any, config: RequestConfig = {}): Promise<T> {
    const session = await getSession()
    
    const headers = new Headers(config.headers)
    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`)
    } else {
      headers.set('Authorization', `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`)
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      ...config,
    })

    const data = await res.json()
    
    if (!res.ok) {
        throw { 
            status: res.status, 
            message: data.error || data.message || 'An error occurred',
            code: data.code
        }
    }

    return data.data !== undefined ? data.data : data
  },

  async patch<T>(endpoint: string, body: any, config: RequestConfig = {}): Promise<T> {
    const session = await getSession()
    
    const headers = new Headers(config.headers)
    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`)
    } else {
      headers.set('Authorization', `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`)
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
      ...config,
    })

    const data = await res.json()
    
    if (!res.ok) {
        throw { 
            status: res.status, 
            message: data.error || data.message || 'An error occurred',
            code: data.code
        }
    }

    return data.data !== undefined ? data.data : data
  },

  async delete<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const session = await getSession()
    
    const headers = new Headers(config.headers)
    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`)
    } else {
      headers.set('Authorization', `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`)
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
      ...config,
    })

    const data = await res.json()
    
    if (!res.ok) {
        throw { 
            status: res.status, 
            message: data.error || data.message || 'An error occurred',
            code: data.code
        }
    }

    return data.data !== undefined ? data.data : data
  }
}
