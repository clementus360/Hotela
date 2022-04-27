const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { PrismaClient } = require('@prisma/client')

const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 3000

const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')

const typeDefs = fs.readFileSync(path.join(__dirname,'schema.graphql'), 'utf8')
const resolvers = {
	Query,
	Mutation
}
const prisma = new PrismaClient()

const startApolloServer = async (typeDefs, resolvers) => {
	const server = new ApolloServer({
		typeDefs,
		resolvers,
		context: {
			prisma
		}
	})

	const app = express()

	await server.start()
	server.applyMiddleware({ app })

	app.listen( PORT, () => {
		console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`)
	})
}

startApolloServer(typeDefs, resolvers)
