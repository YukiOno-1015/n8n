// Integration tests need real fs modules for package metadata reads and sqlite loading.
jest.unmock('node:fs');
jest.unmock('node:fs/promises');
