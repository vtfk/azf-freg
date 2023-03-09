// Example test with function on the outside
const testFunction = () => {
  console.log('Hei')

}
test('description of a test', testFunction)

// Example test with function directly in the test
test('description of the test', () => {
  console.log('Hei')
  expect(typeof "en string").toBe('object')
})

