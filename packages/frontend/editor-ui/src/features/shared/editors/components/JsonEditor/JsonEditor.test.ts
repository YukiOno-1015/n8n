import { createTestingPinia } from '@pinia/testing';
import JsonEditor from '@/features/shared/editors/components/JsonEditor/JsonEditor.vue';
import { renderComponent } from '@/__tests__/render';
import { waitFor } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';

async function focusEditor(container: Element) {
	await waitFor(() =>
		expect(container.querySelector('.cm-content[contenteditable="true"]')).toBeInTheDocument(),
	);
	(container.querySelector('.cm-content[contenteditable="true"]') as HTMLElement).focus();
}

describe('JsonEditor', () => {
	const renderEditor = (jsonString: string) =>
		renderComponent(JsonEditor, {
			global: {
				plugins: [createTestingPinia()],
			},
			props: { modelValue: jsonString },
		});

	it('renders simple json', async () => {
		const modelValue = '{ "testing": [true, 5] }';
		const { getByRole } = renderEditor(modelValue);
		expect(getByRole('textbox').textContent).toEqual(modelValue);
	});

	it('renders multiline json', async () => {
		const modelValue = '{\n\t"testing": [true, 5]\n}';
		const { getByRole, container } = renderEditor(modelValue);
		const gutter = container.querySelector('.cm-gutters');
		expect(gutter?.querySelectorAll('.cm-lineNumbers .cm-gutterElement').length).toEqual(4);

		const content = getByRole('textbox');
		const lines = [...content.querySelectorAll('.cm-line').values()].map((l) => l.textContent);
		expect(lines).toEqual(['{', '\t"testing": [true, 5]', '}']);
	});

	it('updates editor content when modelValue changes to a value of the same length', async () => {
		const { getByRole, rerender } = renderEditor('{"key": "old"}');

		await rerender({ modelValue: '{"key": "***"}' });

		await waitFor(() => expect(getByRole('textbox').textContent).toEqual('{"key": "***"}'));
	});

	it('emits update:model-value events', async () => {
		const modelValue = '{ "test": 1 }';

		const { emitted, container } = renderEditor(modelValue);

		await focusEditor(container);
		await userEvent.keyboard('test');

		await waitFor(() => expect(emitted('update:modelValue')).toContainEqual(['test{ "test": 1 }']));
	});
});
