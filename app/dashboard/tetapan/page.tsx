"use client"

import { useState } from "react"

export default function TetapanPage() {
  const [form, setForm] = useState({ passwordLama: "", passwordBaru: "", passwordSahkan: "" })
  const [loading, setLoading] = useState(false)
  const [mesej, setMesej] = useState<{ jenis: "berjaya" | "ralat"; teks: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMesej(null)

    if (form.passwordBaru !== form.passwordSahkan) {
      setMesej({ jenis: "ralat", teks: "Password baru tidak sepadan" })
      return
    }

    setLoading(true)
    const res = await fetch("/api/user/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passwordLama: form.passwordLama, passwordBaru: form.passwordBaru }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setMesej({ jenis: "berjaya", teks: "Password berjaya ditukar!" })
      setForm({ passwordLama: "", passwordBaru: "", passwordSahkan: "" })
    } else {
      setMesej({ jenis: "ralat", teks: data.error ?? "Ralat berlaku" })
    }
  }

  return (
    <div className="max-w-md">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-700 mb-5">Tukar Password</h2>

        {mesej && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            mesej.jenis === "berjaya"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {mesej.teks}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password Lama</label>
            <input
              type="password"
              value={form.passwordLama}
              onChange={(e) => setForm({ ...form, passwordLama: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password Baru</label>
            <input
              type="password"
              value={form.passwordBaru}
              onChange={(e) => setForm({ ...form, passwordBaru: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-400 mt-1">Minimum 6 aksara</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Sahkan Password Baru</label>
            <input
              type="password"
              value={form.passwordSahkan}
              onChange={(e) => setForm({ ...form, passwordSahkan: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Tukar Password"}
          </button>
        </form>
      </div>
    </div>
  )
}
