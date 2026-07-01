import { Container } from '@n8n/di';
import { mock } from 'jest-mock-extended';
import type { SSHCredentials } from 'n8n-workflow';

import { SSHClientsManager } from '../../../ssh-clients-manager';
import { getSSHTunnelFunctions } from '../ssh-tunnel-helper-functions';

describe('getSSHTunnelFunctions', () => {
	const abortController = new AbortController();
	const credentials = mock<SSHCredentials>();
	const getClientMock = jest.fn() as jest.MockedFunction<SSHClientsManager['getClient']>;
	const updateLastUsedMock = jest.fn() as jest.MockedFunction<SSHClientsManager['updateLastUsed']>;
	const sshClientsManager = {
		getClient: getClientMock,
		updateLastUsed: updateLastUsedMock,
	} as unknown as SSHClientsManager;
	Container.set(SSHClientsManager, sshClientsManager);
	const sshTunnelFunctions = getSSHTunnelFunctions();

	it('should return SSH tunnel functions', () => {
		expect(typeof sshTunnelFunctions.getSSHClient).toBe('function');
	});

	describe('getSSHClient', () => {
		it('should invoke sshClientsManager.getClient', async () => {
			getClientMock.mockResolvedValue(undefined as never);
			await sshTunnelFunctions.getSSHClient(credentials, abortController);

			expect(getClientMock).toHaveBeenCalledWith(credentials, abortController);
		});
	});

	describe('updateLastUsed', () => {
		it('should invoke sshClientsManager.updateLastUsed', async () => {
			// ARRANGE
			getClientMock.mockResolvedValue(undefined as never);
			const client = await sshTunnelFunctions.getSSHClient(credentials, abortController);

			// ACT
			sshTunnelFunctions.updateLastUsed(client);

			// ASSERT
			expect(updateLastUsedMock).toHaveBeenCalledWith(client);
		});
	});
});
