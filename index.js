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
      $(this.form.elements).focus((e) => { e.target.style = '' }); //очищение красной подсветки у инпутов
      this.reqCounter = 0; // вспомогательная переменная чтобы выйти из "вечного" статуса progress без сервера
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
    /**
     * Метод highlightErrors подсвечивает поля которые не прошли валидацию
     * @param {Valid} Объект с признаком результата валидации (isValid) и массивом названий полей, которые не прошли валидацию (errorFields).
     */
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
      let validate = this.validate();
      console.log(validate);
      this.highlightErrors(this.validate())
      let status = validate.isValid ? 'success' : 'error';
      this.sendAjax(this.getData(), status);
    }
    /**
     * Метод message позволяет выводить сообщение для пользователя и выставлять соответсвующие стили элементам
     * @param {response} Объект типа response  с ответом сервера включает поля status(string), reason(string), timeout(number) 
     */
    message({ status, reason, timeout }) {
      //{"status":"success"} – контейнеру resultContainer должен быть выставлен класс success и добавлено содержимое с текстом "Success"
      if (status === 'success') {
        $('#resultContainer').addClass('success');
        $('#resultContainer').text('Success');
      }
      // {"status":"error","reason":String} - контейнеру resultContainer должен быть выставлен класс error и добавлено содержимое с текстом из поля reason
      else if (status === 'error') {
        $('#resultContainer').addClass('error');
        $('#resultContainer').text(reason);
      }
      // {"status":"progress","timeout":Number} - контейнеру resultContainer должен быть выставлен класс progress  
      // через timeout миллисекунд необходимо повторить запрос (логика должна повторяться, пока в ответе не вернется отличный от progress статус)
      else if (status === 'progress') {
        $('#resultContainer').addClass('progress');
        setTimeout(() => { this.sendAjax(this.getData()) }, timeout);
      }
    }
    /**
     * Метод sendAjax обеспечивает отправку ajax запроса
     * @param status - вспомогательный параметр чтобы не поднимать сервер для валидации полей
     * @param data - данные для отправки
     */
    sendAjax(data, status = 'success') {
      console.info(data);
      // Вспомогательный блок кода чтобы выйти из бесконечного статуса 'progress'
      if (status === 'progress') {
        this.reqCounter++
      }
      if (this.reqCounter >= 5 && status === 'progress') {
        status = 'success';
      }
      // Конец блока
      let self = this;
      $.get(`api/${status}.json`, data)
        .then((response) => {
          console.info(response);
          self.message(response);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  //export to the global namespace
  window.MyForm = new MyForm();
})
