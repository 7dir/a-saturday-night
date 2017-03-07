var getUrlParams = require('../../utils').getUrlParams;
var defaultDanceData = require('json!../../../assets/dance.json');

AFRAME.registerComponent('replay', {
  init: function () {
    this.onEnterVR = this.onEnterVR.bind(this);
  },

  play: function () {
    this.el.addEventListener('enter-vr', this.onEnterVR);
  },

  pause: function () {
    this.el.removeEventListener('enter-vr', this.onEnterVR);
  },

  onEnterVR: function () {
    this.el.querySelector('#spectatorCameraRig').setAttribute('position','0 0 1.5');
  },

  loadDance: function (data) {
    var self = this;
    var el = this.el;
    window.isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    var timeout = isChrome ? 0 : 800;
    var selectedAvatarEl = this.selectedAvatarEl = document.getElementById(data.avatar);
    var selectedAvatarHeadEl = selectedAvatarEl.querySelector('.head');
    var selectedAvatarRightHandEl = selectedAvatarEl.querySelector('.rightHand');
    var selectedAvatarLeftHandEl = selectedAvatarEl.querySelector('.leftHand');
    var avatarHeadEl = document.getElementById('avatarHead');
    var rightHandEl = document.getElementById('rightHand');
    var leftHandEl = document.getElementById('leftHand');
    this.cameraRig = document.getElementById('cameraRig');
    if (!el.hasLoaded) {
      el.addEventListener('loaded', function () {
        self.loadDance(data);
      });
      return;
    }
    avatarHeadEl.addEventListener('model-loaded', function () {
      avatarHeadEl.setAttribute('visible', true);
      rightHandEl.setAttribute('visible', true);
      leftHandEl.setAttribute('visible', true);
    });

    el.sceneEl.setAttribute('game-state', 'selectedAvatar', selectedAvatarEl);
    avatarHeadEl.setAttribute('gltf-model', selectedAvatarHeadEl.getAttribute('gltf-model'));
    avatarHeadEl.setAttribute('visible', false);
    rightHandEl.setAttribute('visible', false);
    leftHandEl.setAttribute('visible', false);
    this.cameraRig.setAttribute('rotation', '0 180 0');
    rightHandEl.setAttribute('gltf-model', selectedAvatarRightHandEl.getAttribute('gltf-model'));
    leftHandEl.setAttribute('gltf-model', selectedAvatarLeftHandEl.getAttribute('gltf-model'));

    document.getElementById('backText').setAttribute('visible', false);

    el.setAttribute('avatar-replayer', {
      spectatorMode: true,
      spectatorPosition: '0 1.6 1.5',
      loop: true
    });

    var soundSrc = '#' + data.avatar + (isChrome ? 'ogg' : 'mp3');
    el.sceneEl.setAttribute('game-state', 'dancingTime', document.querySelector(soundSrc).getAttribute('duration'));
    el.components['avatar-replayer'].startReplaying(data.recording);
    document.querySelector('#room [sound]').setAttribute('sound', 'src', soundSrc);
    document.querySelector('#room [sound]').components.sound.playSound();
    this.insertSelectionHands();
    el.emit('dancing');
  },

  insertSelectionHands: function () {
    var leftSelectionHandEl;
    var rightSelectionHandEl;
    var spectatorCameraRigEl;
    if (this.insertedHands) { return; }
    this.onTriggerDown = this.onTriggerDown.bind(this);
    spectatorCameraRigEl = this.el.querySelector('#spectatorCameraRig');
    leftSelectionHandEl = this.leftSelectionHandEl = document.createElement('a-entity');
    rightSelectionHandEl = this.rightSelectionHandEl = document.createElement('a-entity');
    leftSelectionHandEl.id = 'leftSelectionHand';
    rightSelectionHandEl.id = 'rightSelectionHand';
    leftSelectionHandEl.setAttribute('vive-controls', 'hand: left');
    rightSelectionHandEl.setAttribute('vive-controls', 'hand: right');
    spectatorCameraRigEl.appendChild(leftSelectionHandEl);
    spectatorCameraRigEl.appendChild(rightSelectionHandEl);
    leftSelectionHandEl.addEventListener('triggerdown', this.onTriggerDown);
    rightSelectionHandEl.addEventListener('triggerdown', this.onTriggerDown);

    var textProps = {
      font : 'assets/asaturdaynight.fnt',
      color: '#fcff79',
      align: 'right',
      anchor:'right',
      side:  'double',
      value: 'Press trigger >>',
      width: 0.6
    };
    this.leftTooltip = document.createElement('a-entity');
    this.leftTooltip.setAttribute('text', textProps);
    this.leftTooltip.setAttribute('rotation', '-90 0 0');
    this.leftTooltip.setAttribute('position', '-0.01 -0.05 0.05');
    this.rightTooltip = document.createElement('a-entity');
    this.rightTooltip.setAttribute('text', textProps);
    this.rightTooltip.setAttribute('text', {anchor: 'left', align: 'left', value: '<< Press trigger'});
    this.rightTooltip.setAttribute('rotation', '-90 0 0');
    this.rightTooltip.setAttribute('position', '0.01 -0.05 0.05');
    
    leftSelectionHandEl.appendChild(this.leftTooltip);
    rightSelectionHandEl.appendChild(this.rightTooltip);

    this.insertedHands = true;
  },

  onTriggerDown: function () {
    this.el.setAttribute('game-state', 'state', 'avatar-selection');
  },

  remove: function () {
    var i;
    var animationEls = this.el.querySelectorAll('[begin=dancing]');
    document.querySelector('#room [sound]').components.sound.stopSound();
    this.el.removeAttribute('avatar-replayer');
    this.cameraRig.setAttribute('rotation', '0 0 0');
    for (i = 0; i < animationEls.length; ++i) {
      animationEls[i].stop();
    }
    this.leftTooltip.parentNode.removeChild(this.leftTooltip);
    this.rightTooltip.parentNode.removeChild(this.rightTooltip);
    this.leftSelectionHandEl.removeEventListener('triggerdown', this.onTriggerDown);
    this.rightSelectionHandEl.removeEventListener('triggerdown', this.onTriggerDown);
  }
});