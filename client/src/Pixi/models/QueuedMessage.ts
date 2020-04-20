interface QueuedMessage {
	handler: (data: any) => void
	data: any
}

export default QueuedMessage
