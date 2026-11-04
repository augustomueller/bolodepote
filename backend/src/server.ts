import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import { errorHandler } from './middleware/errorHandler.js'
import { despesasRouter } from './routes/despesas.js'
import { produtosRouter } from './routes/produtos.js'
import { relatoriosRouter } from './routes/relatorios.js'
import { vendasRouter } from './routes/vendas.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/produtos', produtosRouter)
app.use('/api/despesas', despesasRouter)
app.use('/api/vendas', vendasRouter)
app.use('/api/relatorios', relatoriosRouter)

app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' })
})
app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`API rodando em http://localhost:${config.port}/api`)
  console.log(`Banco (json-server): ${config.jsonServerUrl}`)
})
