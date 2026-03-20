import { MongoClient } from "mongodb";

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Favor definir MONGODB_URI nas variáveis de ambiente da Vercel");
}

const uri = process.env.MONGODB_URI;

// Conexão singleton para não criar múltiplas conexões no serverless
if (!clientPromise) {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const dbClient = await clientPromise;
      const db = dbClient.db("meubanco"); // Substitua pelo nome do seu DB
      const collection = db.collection("sensores"); // Coleção que vai armazenar os dados

      const data = req.body;
      if (!data) {
        return res.status(400).json({ error: "Nenhum dado enviado" });
      }

      await collection.insertOne({ ...data, timestamp: new Date() });
      return res.status(201).json({ message: "Dados salvos com sucesso!" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao salvar os dados" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Método ${req.method} não permitido` });
  }
}