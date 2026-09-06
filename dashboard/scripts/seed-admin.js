import axios from "axios"

const BASE = process.env.API_BASE || "http://localhost:8000/api/v1"
const email = "huhehaha.prakaz@gmail.com"
const password = "Admin@123"

async function run() {
  try {
    const res = await axios.post(`${BASE}/auth/seed-admin`)
    console.log("Admin user ready:", res.data?.user?.email)
  } catch (e) {
    console.error("Seed admin failed; ensure backend allows seeding and is running on 8000")
    process.exit(1)
  }
}

run()
