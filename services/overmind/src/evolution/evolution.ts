import { convertToInGameAgent, InGameAgent as InGameAgent, StorageAgent } from '@src/models/agent'
import { getRandomArrayValue, limitValueToInterval } from '@src/utils/Utils'
import * as tf from '@tensorflow/tfjs-node'
import storage from 'node-persist'
import { v4 as uuid } from 'uuid'

export async function createInitialPopulation(size: number): Promise<InGameAgent[]> {
	const population: StorageAgent[] = []
	for (let i = 0; i < size; i++) {
		const weights0_0 = [...(await tf.randomNormal([464, 800]).data())]
		const weights0_1 = [...(await tf.randomNormal([800]).data())]
		const weights1_0 = [...(await tf.randomNormal([800, 50]).data())]
		const weights1_1 = [...(await tf.randomNormal([50]).data())]

		population.push({
			id: uuid(),
			weights0_0,
			weights0_1,
			weights1_0,
			weights1_1,
		})
	}
	await storage.setItem('population', population)

	return population.map((agent) => convertToInGameAgent(agent))
}

export async function createNewPopulation(agents: InGameAgent[]): Promise<StorageAgent[]> {
	const weigthedPopulation: string[] = []

	agents.forEach((agent) => {
		weigthedPopulation.push(...Array(agent.score).fill(agent.id))
	})

	const newAgents = []

	for (let i = 0; i < agents.length; i++) {
		const agent0 = getRandomArrayValue(weigthedPopulation)
		let agent1 = getRandomArrayValue(weigthedPopulation)
		while (agent0 === agent1) {
			agent1 = getRandomArrayValue(weigthedPopulation)
		}
		newAgents.push(createNewAgent(agents.find((agent) => agent.id === agent0)!, agents.find((agent) => agent.id === agent1)!))
	}

	const stuff = await Promise.all(newAgents)

	return stuff
}

function createNewWeigths(weights0: number[], weights1: number[]): number[] {
	const newWeigths: number[] = []

	if (weights0.length !== weights1.length) {
		throw Error('Nope')
	}

	for (let i = 0; i < weights0.length; i++) {
		let value = Math.random() > 0.5 ? weights0[i] : weights1[i]
		if (Math.random() > 0.95) {
			if (Math.random() > 0.5) {
				value += Math.random() * 0.3
			} else {
				value -= Math.random() * 0.3
			}
		}

		newWeigths.push(limitValueToInterval(-1, value, 1))
	}

	return newWeigths
}

async function createNewAgent(agent0: InGameAgent, agent1: InGameAgent): Promise<StorageAgent> {
	return {
		id: uuid(),
		weights0_0: createNewWeigths([...(await agent0.model.getWeights()[0].data())], [...(await agent1.model.getWeights()[0].data())]),
		weights0_1: createNewWeigths([...(await agent0.model.getWeights()[1].data())], [...(await agent1.model.getWeights()[1].data())]),
		weights1_0: createNewWeigths([...(await agent0.model.getWeights()[2].data())], [...(await agent1.model.getWeights()[2].data())]),
		weights1_1: createNewWeigths([...(await agent0.model.getWeights()[3].data())], [...(await agent1.model.getWeights()[3].data())]),
	}
}
