import { mock } from 'jest-mock-extended';
import fs from 'node:fs/promises';
import { Readable } from 'node:stream';

import type { ObjectStoreService } from '@/binary-data/object-store/object-store.service.ee';
import type { MetadataResponseHeaders } from '@/binary-data/object-store/types';
import { ObjectStoreManager } from '@/binary-data/object-store.manager';
import { toFileId, toStream } from '@test/utils';

jest.mock('fs/promises');

const checkConnectionMock: ObjectStoreService['checkConnection'] = jest.fn();
const putMock: ObjectStoreService['put'] = jest.fn();
const getMock: ObjectStoreService['get'] = jest.fn();
const getMetadataMock: ObjectStoreService['getMetadata'] = jest.fn();
const deleteOneMock: ObjectStoreService['deleteOne'] = jest.fn();

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

beforeEach(() => {
	const getMockFn = getMock as jest.Mock;
	getMockFn.mockReset();
	getMockFn.mockImplementation(async (_fileId: string, { mode }: { mode: 'stream' | 'buffer' }) =>
		mode === 'stream' ? mockStream : mockBuffer,
	);
	(checkConnectionMock as jest.Mock).mockReset();
	(putMock as jest.Mock).mockReset();
	(getMetadataMock as jest.Mock).mockReset();
	(deleteOneMock as jest.Mock).mockReset();
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
		(getMock as jest.Mock).mockResolvedValueOnce(mockBuffer);

		const result = await objectStoreManager.getAsBuffer(fileId);

		expect(Buffer.isBuffer(result)).toBe(true);
		expect(getMock).toHaveBeenCalledWith(fileId, { mode: 'buffer' });
	});
});

describe('getAsStream()', () => {
	it('should return a stream', async () => {
		(getMock as jest.Mock).mockResolvedValueOnce(mockStream);

		const stream = await objectStoreManager.getAsStream(fileId);

		expect(stream).toBeInstanceOf(Readable);
		expect(getMock).toHaveBeenCalledWith(fileId, { mode: 'stream' });
	});
});

describe('getMetadata()', () => {
	it('should return metadata', async () => {
		const mimeType = 'text/plain';
		const fileName = 'file.txt';

		(getMetadataMock as jest.Mock).mockResolvedValue(
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
		(getMock as jest.Mock).mockResolvedValueOnce(mockBuffer);

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
		(getMock as jest.Mock).mockResolvedValueOnce(mockBuffer);
		(getMetadataMock as jest.Mock).mockResolvedValueOnce(mock<MetadataResponseHeaders>());

		const promise = objectStoreManager.rename(fileId, otherFileId);

		await expect(promise).resolves.not.toThrow();

		expect(getMock).toHaveBeenCalledWith(fileId, { mode: 'buffer' });
		expect(getMetadataMock).toHaveBeenCalledWith(fileId);
		expect(deleteOneMock).toHaveBeenCalledWith(fileId);
	});
});
