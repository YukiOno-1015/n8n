import { mock } from 'jest-mock-extended';
import fs from 'node:fs/promises';
import { Readable } from 'node:stream';

import { ObjectStoreService } from '@/binary-data/object-store/object-store.service.ee';
import type { MetadataResponseHeaders } from '@/binary-data/object-store/types';
import { ObjectStoreManager } from '@/binary-data/object-store.manager';
import { toFileId, toStream } from '@test/utils';

jest.mock('fs/promises');

const checkConnectionMock = jest.fn() as jest.MockedFunction<ObjectStoreService['checkConnection']>;
const putMock = jest.fn() as jest.MockedFunction<ObjectStoreService['put']>;
const getMock = jest.fn() as jest.MockedFunction<ObjectStoreService['get']>;
const getMetadataMock = jest.fn() as jest.MockedFunction<ObjectStoreService['getMetadata']>;
const deleteOneMock = jest.fn() as jest.MockedFunction<ObjectStoreService['deleteOne']>;

const objectStoreService = {
	checkConnection: checkConnectionMock,
	put: putMock,
	get: getMock,
	getMetadata: getMetadataMock,
	deleteOne: deleteOneMock,
} as unknown as ObjectStoreService;
const objectStoreManager = new ObjectStoreManager(objectStoreService);

const workflowId = 'ObogjVbqpNOQpiyV';
const executionId = '999';
const fileUuid = '71f6209b-5d48-41a2-a224-80d529d8bb32';
const fileId = toFileId(workflowId, executionId, fileUuid);
const prefix = `workflows/${workflowId}/executions/${executionId}/binary_data/`;

const otherWorkflowId = 'FHio8ftV6SrCAfPJ';
const otherExecutionId = '888';
const otherFileUuid = '71f6209b-5d48-41a2-a224-80d529d8bb33';
const otherFileId = toFileId(otherWorkflowId, otherExecutionId, otherFileUuid);

const mockBuffer = Buffer.from('Test data');
const mockStream = toStream(mockBuffer);

beforeAll(() => {
	jest.restoreAllMocks();
});

describe('store()', () => {
	it('should store a buffer', async () => {
		const metadata = { mimeType: 'text/plain' };

		const result = await objectStoreManager.store(
			{ type: 'execution', workflowId, executionId },
			mockBuffer,
			metadata,
		);

		expect(result.fileId.startsWith(prefix)).toBe(true);
		expect(result.fileSize).toBe(mockBuffer.length);
	});
});

describe('getPath()', () => {
	it('should return a path', async () => {
		const path = objectStoreManager.getPath(fileId);

		expect(path).toBe(fileId);
	});
});

describe('getAsBuffer()', () => {
	it('should return a buffer', async () => {
		getMock.mockResolvedValue(mockBuffer);

		const result = await objectStoreManager.getAsBuffer(fileId);

		expect(Buffer.isBuffer(result)).toBe(true);
		expect(getMock).toHaveBeenCalledWith(fileId, { mode: 'buffer' });
	});
});

describe('getAsStream()', () => {
	it('should return a stream', async () => {
		getMock.mockResolvedValue(mockStream);

		const stream = await objectStoreManager.getAsStream(fileId);

		expect(stream).toBeInstanceOf(Readable);
		expect(getMock).toHaveBeenCalledWith(fileId, { mode: 'stream' });
	});
});

describe('getMetadata()', () => {
	it('should return metadata', async () => {
		const mimeType = 'text/plain';
		const fileName = 'file.txt';

		getMetadataMock.mockResolvedValue(
			mock<MetadataResponseHeaders>({
				'content-length': '1',
				'content-type': mimeType,
				'x-amz-meta-filename': fileName,
			}),
		);

		const metadata = await objectStoreManager.getMetadata(fileId);

		expect(metadata).toEqual(expect.objectContaining({ fileSize: 1, mimeType, fileName }));
		expect(getMetadataMock).toHaveBeenCalledWith(fileId);
	});
});

describe('copyByFileId()', () => {
	it('should copy by file ID and return the file ID', async () => {
		const targetFileId = await objectStoreManager.copyByFileId(
			{ type: 'execution', workflowId, executionId },
			fileId,
		);

		expect(targetFileId.startsWith(prefix)).toBe(true);
		expect(getMock).toHaveBeenCalledWith(fileId, { mode: 'buffer' });
	});
});

describe('copyByFilePath()', () => {
	test('should copy by file path and return the file ID and size', async () => {
		const sourceFilePath = 'path/to/file/in/filesystem';
		const metadata = { mimeType: 'text/plain' };

		fs.readFile = jest.fn().mockResolvedValue(mockBuffer);

		const result = await objectStoreManager.copyByFilePath(
			{ type: 'execution', workflowId, executionId },
			sourceFilePath,
			metadata,
		);

		expect(result.fileId.startsWith(prefix)).toBe(true);
		expect(fs.readFile).toHaveBeenCalledWith(sourceFilePath);
		expect(result.fileSize).toBe(mockBuffer.length);
	});
});

describe('rename()', () => {
	it('should rename a file', async () => {
		const promise = objectStoreManager.rename(fileId, otherFileId);

		await expect(promise).resolves.not.toThrow();

		expect(getMock).toHaveBeenCalledWith(fileId, { mode: 'buffer' });
		expect(getMetadataMock).toHaveBeenCalledWith(fileId);
		expect(deleteOneMock).toHaveBeenCalledWith(fileId);
	});
});
