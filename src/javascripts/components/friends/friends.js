import firebase from 'firebase/app';
import 'firebase/auth';
import util from '../../helpers/util';
import friendsData from '../../helpers/data/friendsData';
import rsvpData from '../../helpers/data/rsvpData';
import birthdayData from '../../helpers/data/birthdayData';
import SMASH from '../../helpers/smash';

const createNewFriend = (e) => {
  e.preventDefault();
  const newFriend = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    uid: firebase.auth().currentUser.uid,
  };
  friendsData.addNewFriend(newFriend)
    .then(() => {
      document.getElementById('name').value = '';
      document.getElementById('email').value = '';
      document.getElementById('birthday').classList.remove('hide');
      document.getElementById('new-friend').classList.add('hide');
      getFriends(firebase.auth().currentUser.uid); // eslint-disable-line no-use-before-define
    })
    .catch(err => console.error('no new friend for you', err));
};

const newFriendButton = () => {
  document.getElementById('birthday').classList.add('hide');
  document.getElementById('new-friend').classList.remove('hide');
  document.getElementById('saveNewFriend').addEventListener('click', createNewFriend);
};

const deleteFriendsEvent = (e) => {
  const friendId = e.target.id;
  friendsData.deleteFriend(friendId)
    .then(() => getFriends(firebase.auth().currentUser.uid)) // eslint-disable-line no-use-before-define
    .catch(err => console.error('no deletion', err));
};

const radioButtonEvent = (e) => {
  const rsvpId = e.target.closest('td').id;
  console.error(rsvpId);
  const rsvp = {
    birthdayId: e.target.closest('table').id,
    friendId: e.target.id.split('.')[1],
    statusId: e.target.value,
  };
  if (rsvpId) {
    // update
    rsvpData.editRsvp(rsvpId, rsvp)
      .then(() => getFriends(firebase.auth().currentUser.uid)) // eslint-disable-line no-use-before-define
      .catch(err => console.error('no update', err));
  } else {
    // add
    rsvpData.addRsvp(rsvp)
      .then(() => getFriends(firebase.auth().currentUser.uid)) // eslint-disable-line no-use-before-define
      .catch(err => console.error('no add', err));
  }
};

const addEvents = () => {
  document.getElementById('add-friend-button').addEventListener('click', newFriendButton);
  const deleteButtons = document.getElementsByClassName('delete-friend');
  for (let i = 0; i < deleteButtons.length; i += 1) {
    deleteButtons[i].addEventListener('click', deleteFriendsEvent);
  }
  const radioButtons = document.getElementsByClassName('radio');
  for (let j = 0; j < radioButtons.length; j += 1) {
    radioButtons[j].addEventListener('click', radioButtonEvent);
  }
};
const showFriends = (friends, birthdayId) => {
  let domString = '<div class="col-6 offset-3">';
  domString += '<h2>Invited friends</h2>';
  domString += '<button id="add-friend-button" class="btn btn-info">Add Friend</button>';
  domString += `<table class="table table-striped" id=${birthdayId}>`;
  domString += '<thead>';
  domString += '<tr>';
  domString += '<th scope="col">Name</th>';
  domString += '<th scope="col">Email</th>';
  domString += '<th scope="col">RSVP</th>';
  domString += '<th scope="col"></th>';
  domString += '</tr>';
  domString += '</thead>';
  domString += '<tbody>';
  friends.forEach((friend) => {
    domString += '<tr>';
    domString += `<td>${friend.name}</td>`;
    domString += `<td>${friend.email}</td>`;
    domString += `<td id=${friend.rsvpId}>`;
    domString += '<div class="custom-control custom-radio custom-control-inline">';
    domString += `<input type="radio" id="radio1.${friend.id}" name="radio-buttons.${friend.id}" class="custom-control-input radio" value="status2" ${friend.statusId === 'status2' ? 'checked' : ''}>`;
    domString += `<label class="custom-control-label" for="radio1.${friend.id}">Yes</label>`;
    domString += '</div>';
    domString += '<div class="custom-control custom-radio custom-control-inline">';
    domString += `<input type="radio" id="radio2.${friend.id}" name="radio-buttons.${friend.id}" class="custom-control-input radio" value="status3"${friend.statusId === 'status3' ? 'checked' : ''}>`;
    domString += `<label class="custom-control-label" for="radio2.${friend.id}">No</label>`;
    domString += '</div>';
    domString += '<div class="custom-control custom-radio custom-control-inline">';
    domString += `<input type="radio" id="radio3.${friend.id}" name="radio-buttons.${friend.id}" class="custom-control-input radio" value="status1" ${friend.statusId === 'status1' ? 'checked' : ''}>`;
    domString += `<label class="custom-control-label" for="radio3.${friend.id}">Unknown</label>`;
    domString += '</div>';
    domString += '</td>';
    domString += `<th scope="col"><button id=${friend.id} class="btn btn-danger delete-friend">X</button></th>`;
    domString += '</tr>';
  });
  domString += '</tbody>';
  domString += '</table>';
  domString += '</div>';
  util.printToDom('friends', domString);
  addEvents();
};

const getFriends = (uid) => {
  friendsData.getFriendsByUid(uid)
    .then((friends) => {
      birthdayData.getBirthdayByUid(uid)
        .then((bday) => {
          rsvpData.getRsvpsByBirthdayId(bday.id).then((rsvps) => {
            const finalFriends = SMASH.friendRsvps(friends, rsvps);
            showFriends(finalFriends, bday.id);
          });
        });
    })
    .catch(err => console.error('no friends', err));
};

export default { getFriends };
