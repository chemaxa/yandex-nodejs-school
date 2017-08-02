$(() => {
  class Validator {
    constructor(types = {}) {
      this.types = Object.assign(types, {
        fio: {
          field: 'fio',
          validate: val => /^([A-Za-zА-Яа-яЁё]+)\s([A-Za-zА-Яа-яЁё]+)\s([A-Za-zА-Яа-яЁё]+)\s?$/i.test(val)
        },
        email: {
          field: 'email',
          validate: val => /^[0-9._A-Za-zА-Яа-яЁё-]+@((ya|yandex).(ru|com|kz|by|ua))$/i.test(val)
        },
        phone: {
          field: 'phone',
          validate: (val) => {
            const YANDEX = 30;
            let isPhone = /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/i.test(val);
            let sum = 0;
            if (isPhone) {
              sum = val
                .replace(/\+|\(|\)|\-/ig, '')
                .split('')
                .reduce((prev, curr) =>
                  parseInt(prev, 10) + parseInt(curr, 10)
                );
            }
            return isPhone && (sum < 30);
          }
        }
      });
    }
    validate(data) {
      let msg, checker;
      this.errorFields = [];
      for (let type in data) {
        if (data.hasOwnProperty(type)) {
          checker = this.types[type];
          if (!checker) {
            throw {
              name: `ValidationError`,
              message: `Нет обработчика для ${type}`
            };
          };
          let isOk = data[type] ? checker.validate(data[type]) : false;
          if (!isOk) {
            this.errorFields.push(checker.field);
          }
        }
      }
      return this.errorFields.length === 0;
    }
  }
  class MyForm {
    constructor(form = '#myForm') {
      this.form = document.querySelector(form);
      this.form.addEventListener('submit', this.submit.bind(this));
      $(this.form.elements).focus((e) => { e.target.style = '' });//clear red border after changes 
    }
    /**
     * Метод validate возвращает объект с признаком результата валидации (isValid) и массивом названий полей, которые не прошли валидацию (errorFields).
     * @return {Valid} 
     */
    validate() {
      let formData = this.getData();
      let validator = new Validator();
      return {
        isValid: validator.validate(formData),
        errorFields: validator.errorFields
      }
    }
    highlightErrors({ errorFields }) {
      errorFields.forEach((field) => {
        $(`[name=${field}]`).css({ 'border': '1px solid red' })
      }, this);
    }
    /**
     * Метод getData возвращает объект с данными формы, где имена свойств совпадают с именами инпутов.
     * @return {FormData}
     */
    getData() {
      let formData = new FormData(this.form);
      let tmpData = {};
      for (let pair of formData.entries()) {
        tmpData[pair[0]] = pair[1];
      }
      return tmpData;
    }
    /**
     * Метод setData принимает объект с данными формы и устанавливает их инпутам формы. 
     * Поля кроме phone, fio, email игнорируются.
     * @param {FormData}
     */
    setData({ phone, fio, email }) {
      this.form.fio.value = fio;
      this.form.phone.value = phone;
      this.form.email.value = email;
    }
    /**
     * Метод submit выполняет валидацию полей и отправку ajax-запроса, если валидация пройдена. 
     * Вызывается по клику на кнопку отправить.
     */
    submit(e) {
      e.preventDefault();
      console.log(this.validate())
      this.highlightErrors(this.validate())
      this.sendAjax(this.getData())
    }
    /**
     * Метод sendAjax обеспечивает отправку ajax запроса
     * @param status - вспомогательный параметр чтобы не поднимать сервер для валидации полей
     * @param data - данные для отправки
     */
    sendAjax(data, status = 'success') {
      console.info(data);
      $.get(`api/${status}.json`, data)
        .then((response) => {
          console.info(response);
        })
        .catch((err) => {
          console.info(err);
        });
    }
  }

  //export to the global namespace
  window.MyForm = new MyForm();
})
