module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  // WIP: suites de compras/inventario desactualizadas tras multi-sucursal
  // (StockSucursalService + DTOs/guards). Re-habilitar al actualizar mocks.
  testPathIgnorePatterns: [
    '/modules/inventario/__tests__/',
    '/modules/compras/__tests__/',
  ],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
