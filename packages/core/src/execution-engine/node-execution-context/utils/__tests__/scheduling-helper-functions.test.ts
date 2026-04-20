import { Container } from '@n8n/di';
import { mock } from 'jest-mock-extended';
import type { CronContext, Workflow } from 'n8n-workflow';

import { ScheduledTaskManager } from '../../../scheduled-task-manager';
import { getSchedulingFunctions } from '../scheduling-helper-functions';

describe('getSchedulingFunctions', () => {
	const workflow = mock<Workflow>({ id: 'test-workflow', timezone: 'Europe/Berlin' });
	const cronExpression = '* * * * * 0';
	const onTick = jest.fn();
	const registerCronMock = jest.fn() as jest.MockedFunction<ScheduledTaskManager['registerCron']>;
	const scheduledTaskManager = {
		registerCron: registerCronMock,
	} as unknown as ScheduledTaskManager;
	const schedulingFunctions = getSchedulingFunctions(
		workflow.id,
		workflow.timezone,
		'test-node-id',
	);

	beforeAll(() => {
		Container.set(ScheduledTaskManager, scheduledTaskManager);
	});

	beforeEach(() => {
		registerCronMock.mockReset();
	});

	it('should return scheduling functions', () => {
		expect(typeof schedulingFunctions.registerCron).toBe('function');
	});

	describe('registerCron', () => {
		it('should invoke scheduledTaskManager.registerCron', () => {
			const ctx: CronContext = {
				nodeId: 'test-node-id',
				expression: cronExpression,
				workflowId: 'test-workflow',
				timezone: 'Europe/Berlin',
			};

			schedulingFunctions.registerCron({ expression: cronExpression }, onTick);

			expect(registerCronMock).toHaveBeenCalledWith(ctx, onTick);
		});
	});
});
