import { BradestatwebPage } from './app.po';

describe('bradestatweb App', function() {
  let page: BradestatwebPage;

  beforeEach(() => {
    page = new BradestatwebPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
