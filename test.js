const Wargamer = require('wargamer').default;

const wot = Wargamer.WoT({ realm: 'ru', applicationId: 'bbbfdd36b7156fefbed419ac0c487a0d'});

wot.get('account/list', { search: 'Straik' })
  .then((response) => {
    console.log(response.meta); // { count: 100 }
    console.log(response.data); // [{ nickname: 'Straik', account_id: 73892 }, ...]
  })
  .catch((error) => {
    console.log(error.message);
  });