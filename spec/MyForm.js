$(() => {
  mocha.setup('bdd')
  var assert = chai.assert;
  var expect = chai.expect;
  describe("MyForm", () => {
    describe("getData", () => {
      it("should be able to return object with form data with fields fio, name, email", () => {
        let data = MyForm.getData();
        assert.typeOf(data, 'object');
        expect(data).to.have.property('fio');
        expect(data).to.have.property('phone');
        expect(data).to.have.property('email');
      });
    });
    describe("setData", () => {
      it("should be able to input object with form data fields fio, name, email and setup this values into form", () => {
        let mock = {
          phone: '+7(999)999-99-99',
          fio: 'Yandex Yandex Yandex',
          email: 'ya@ya.ru',
          notexist: 'undefined'
        };
        MyForm.setData(mock);
        let form = $('#myForm')[0];
        let fio = form.fio.value;
        let phone = form.phone.value;
        let email = form.email.value;
        expect(fio).to.equal(mock.fio);
        expect(phone).to.equal(mock.phone);
        expect(email).to.equal(mock.email);
      });
    });
  });
  mocha.run();
})
