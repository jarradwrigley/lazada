"use server"

export async function getNodeEnv() {
    return process.env.NODE_ENV
}