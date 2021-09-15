import * as tf from '@tensorflow/tfjs-node'

export type InGameAgent = {
	id: string
	model: tf.Sequential
	score: number
}

export type StorageAgent = {
	id: string
	weights0_0: number[]
	weights0_1: number[]
	weights1_0: number[]
	weights1_1: number[]
}

export function convertToInGameAgent(storageAgent: StorageAgent): InGameAgent {
	return {
		id: storageAgent.id,
		model: tf.sequential({
			layers: [
				tf.layers.dense({
					inputShape: [464],
					units: 800,
					activation: 'relu',
					weights: [tf.tensor(storageAgent.weights0_0, [464, 800]), tf.tensor(storageAgent.weights0_1, [800])],
				}),
				tf.layers.dense({
					units: 50,
					activation: 'softmax',
					weights: [tf.tensor(storageAgent.weights1_0, [800, 50]), tf.tensor(storageAgent.weights1_1, [50])],
				}),
			],
		}),
		score: 0,
	}
}

export async function convertToStorageAgent(agent: InGameAgent): Promise<StorageAgent> {
	const weights0_0 = [...(await agent.model.getWeights()[0].data())]
	const weights0_1 = [...(await agent.model.getWeights()[1].data())]
	const weights1_0 = [...(await agent.model.getWeights()[2].data())]
	const weights1_1 = [...(await agent.model.getWeights()[3].data())]

	return {
		id: agent.id,
		weights0_0,
		weights0_1,
		weights1_0,
		weights1_1,
	}
}
