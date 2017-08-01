$(() => {
  class Validator {
    fio() {
      return {
        type: 'fio',
        regexp: '^([A-Za-zА-Яа-яЁё]+\s?){3}'
      }
    }
    email() {
      return {
        type: 'email',
        regexp: '[0-9._A-Za-zА-Яа-яЁё-]+@((ya|yandex).(ru|com|kz|by|ua))'
      }
    }
    phone() {
      return {
        type: 'phone',
        regexp: '\+7\(\d{3}\)\d{3}-\d{2}-\d{2}'
      }
    }
  }
  class MyForm {
    constructor(form = '#myForm') {
      this.form = document.querySelector(form);
      this.form.addEventListener('submit', this.submit.bind(this));
    }
    /**
     * Метод validate возвращает объект с признаком результата валидации (isValid) и массивом названий полей, которые не прошли валидацию (errorFields).
     * @return {Valid} 
     */
    validate() {
      let formData = this.getData();
      let errorFields = [];
      let isValid = false;
      let check = ()=>{

      }
      
      return {
        isValid,
        errorFields
      }
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