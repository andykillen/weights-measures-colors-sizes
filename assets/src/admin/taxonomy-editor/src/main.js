import App from './App.svelte';

const app = new App({
	target: document.getElementById('taxonomy-editor'),
	props: {
		infoset : taxonomyinfoset,
		settings : settings
	}
});

export default app;