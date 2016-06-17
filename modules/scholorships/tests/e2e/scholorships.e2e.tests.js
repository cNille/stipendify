'use strict';

describe('Scholorships E2E Tests:', function () {
  describe('Test Scholorships page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/scholorships');
      expect(element.all(by.repeater('scholorship in scholorships')).count()).toEqual(0);
    });
  });
});
