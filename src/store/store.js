import { createStore } from 'vuex';
import { jwtDecode } from 'jwt-decode';
import metronomeSettingsService from '@/services/metronomeSettingsService';
import { getAudioContext } from '@/helpers/audioContextHelper'

const store = createStore({
    state: {
        // state props...
    },
    mutations: {
        // mutations ...
    },
    actions: {
        initializeMetronome({ state, commit, dispatch }) {
            // The core metronome logic has been removed from this
            // public version fro IP protection purposes.
            // You can try the live demo at: https://speedup.yurkinsson.com
        }
    },
    getters: {
        // getters ...
    },
});

export default store;
