import { db } from './firebase.js';
import { __, applyI18n } from './locales.js';

var currentUser = null;
var PACKS_LIMIT = 5;

export function getCurrentUser() {
  return currentUser;
}

export function signIn() {
  return firebase.auth().signInAnonymously().catch(function(err) {
    throw new Error(__('packs.error.auth', {msg: err.message}));
  });
}

firebase.auth().onAuthStateChanged(function(user) {
  currentUser = user;
});

function genRecoveryCode() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var code = '';
  for (var i = 0; i < 6; i++) { code += chars.charAt(Math.floor(Math.random() * chars.length)); }
  return code;
}

export function savePack(name, items) {
  return signIn().then(function() {
    var uid = currentUser.uid;
    return db.ref('packs/' + uid).once('value').then(function(snap) {
      var packs = snap.val() || {};
      var packCount = Object.keys(packs).length;
      if (packCount >= PACKS_LIMIT) {
        throw new Error(__('packs.error.limit'));
      }
      var packRef = db.ref('packs/' + uid).push();
      var packId = packRef.key;
      var recoveryCode = genRecoveryCode();
      return packRef.set({
        name: name,
        items: items,
        created: firebase.database.ServerValue.TIMESTAMP
      }).then(function() {
        return db.ref('packs_index/' + recoveryCode).set({ uid: uid, packId: packId });
      }).then(function() {
        return { packId: packId, recoveryCode: recoveryCode };
      });
    });
  });
}

export function loadUserPacks() {
  return signIn().then(function() {
    var uid = currentUser.uid;
    return db.ref('packs/' + uid).once('value').then(function(snap) {
      var data = snap.val() || {};
      var list = [];
      for (var id in data) {
        list.push({ id: id, name: data[id].name, created: data[id].created, itemCount: (data[id].items || []).length });
      }
      list.sort(function(a, b) { return (b.created || 0) - (a.created || 0); });
      return list;
    });
  });
}

export function loadPack(packId) {
  return signIn().then(function() {
    var uid = currentUser.uid;
    return db.ref('packs/' + uid + '/' + packId).once('value').then(function(snap) {
      var data = snap.val();
      if (!data) throw new Error(__('packs.error.notFound'));
      return { id: packId, name: data.name, items: data.items || [] };
    });
  });
}

export function loadByRecoveryCode(code) {
  code = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== 6) return Promise.reject(new Error(__('packs.error.invalidCode')));
  return db.ref('packs_index/' + code).once('value').then(function(snap) {
    var index = snap.val();
    if (!index) throw new Error(__('packs.error.codeNotFound'));
    return db.ref('packs/' + index.uid + '/' + index.packId).once('value').then(function(packSnap) {
      var data = packSnap.val();
      if (!data) throw new Error(__('packs.error.notFound'));
      return { id: index.packId, name: data.name, items: data.items || [] };
    });
  });
}

export function deletePack(packId) {
  return signIn().then(function() {
    var uid = currentUser.uid;
    return db.ref('packs/' + uid + '/' + packId).remove();
  });
}
