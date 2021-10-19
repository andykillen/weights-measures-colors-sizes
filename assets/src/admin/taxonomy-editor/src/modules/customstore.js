import { writable } from 'svelte/store';

function createInfoSet() {
	const { subscribe, set, update } = writable({});

    const save = document.getElementById('taxonomy-editor-save');

    function saveSettings(values) {
        save.value = JSON.stringify(values);
    }

	return {
		subscribe,
		set: (values) => { 
            set(values); 
            saveSettings(values);  
        },
        update: (values) => { 
            update(values);
            saveSettings(values);  
        },
        // updateTaxonomy: (taxonomy_name, key, values) => {
        // maybe later
        // }
	};
}

const settingsInfoset = createInfoSet()
export default settingsInfoset;