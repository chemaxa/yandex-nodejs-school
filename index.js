$(() => {
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
      return {
        isValid: false,
        errorFields: []
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