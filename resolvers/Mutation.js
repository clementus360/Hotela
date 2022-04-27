const { ApolloError } = require('apollo-server-express')

const addRoomType = async (parent, args, { prisma }) => {
	await prisma.$connect()

	const { userInput } = args

	return await prisma.RoomType.create({
		data: {
			name: userInput.name,
			description: userInput.description,
			image: userInput.image,
			facilities: userInput.facilities,
			price: userInput.price,
			occupancy: userInput.occupancy,
		}
	})
}

const addRoom = async (parent, args, { prisma }) => {
	await prisma.$connect()

	const { userInput } = args

	const RoomType = await prisma.RoomType.findUnique({
		where: {
			name: userInput.type
		}
	})

	return await prisma.Room.create({
		data: {
			name: userInput.name,
			occupied: userInput.occupied,
			reserved: userInput.reserved,
			type: { connect: { id: RoomType.id }}
		},
		include: {
			type: true
		}
	})
}

const reserveRoom = async (parent, args, { prisma }) => {
	await prisma.$connect()
	const { userInput } = args
	let today = new Date().toLocaleDateString("en-UK");

	const RoomType = await prisma.RoomType.findUnique({
		where: {
			name: userInput.roomType
		}
	})

	const AvailableRoom = await prisma.Room.findMany({
		where: {
			type: {
				name: userInput.roomType
			},
			occupied: false,
			reserved: false
		}
	})

	if (!AvailableRoom[0]) {
		throw new ApolloError('There are no available rooms')
	}

	await prisma.Room.update({
		where: {
			id: AvailableRoom[0].id
		},
		data: {
			occupied: false,
			reserved: true
		}
	})

	return await prisma.RoomReservation.create({
		data: {
			clientName: userInput.clientName,
			email: userInput.email,
			checkInDate: userInput.checkInDate,
			checkOutDate: userInput.checkOutDate,
			nights: userInput.nights,
			reservationDate: today,
			assured: userInput.assured,
			roomType: { connect: { id: RoomType.id }},
			room: { connect: { id: AvailableRoom[0].id }},
			cost: RoomType.price * userInput.nights
		},
		include: {
			room: true,
			roomType: true
		}
	})
}

const checkIn = async (parent, args, { prisma }) => {
	const { userInput } = args

	const reservedRoom = await prisma.RoomReservation.findMany({
		where: {
			room: {
				name: userInput.room,
			}
		},
		include: {
			room: true
		}
	})

	if (!reservedRoom[0]) {
		throw new ApolloError(`There is no reservation for room ${userInput.room}`)
	}

	if(reservedRoom[0].room.occupied) {
		throw new ApolloError('The room is occupied')
	}

	return await prisma.RoomReservation.update({
		where: {
			id: reservedRoom[0].id
		},
		data: {
			room: {
				update: {
					occupied: true,
					reserved: false
				}
			}
		},
		include: {
			room: true
		}
	})
}

module.exports = {
	addRoom,
	addRoomType,
	reserveRoom,
	checkIn
}
