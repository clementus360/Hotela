const getRooms = async (parent, args, { prisma }) => {
	return await prisma.Room.findMany({
		include: {
			type: true
		}
	})
}

const getRoomTypes = async (parent, args, { prisma }) => {
	return await prisma.RoomType.findMany()
}

const getRoomReservations = async (parent, args, { prisma }) => {
	return await prisma.RoomReservation.findMany({
		include: {
			room: true,
			roomType: true
		}
	})
}

module.exports = {
	getRooms,
	getRoomTypes,
	getRoomReservations
}
