<script>
	import settingsInfoset from "./modules/customstore.js";
	import Switch from "./Switch.svelte";
	import Tabs from "./Tabs.svelte";
	import {yesno} from "./modules/settingsDefaults";
	console.log('am I trying?');
	export let cats;

	export let infoset;

	settingsInfoset.set(infoset);
	console.log('am I wokrung?');
	console.log(cats);

</script>
<style>
	section {
		position: relative;
		margin-top: 3rem;
	}
	h1 {
		margin-left:7rem;
	}
	
</style>
{#each $settingsInfoset as taxonomy}
<section>
<h1>{@html taxonomy.taxonomy_title}</h1>
<Switch value={taxonomy.use} values={yesno.values} name={taxonomy.taxonomy_name} id={taxonomy.taxonomy_name} />
<Tabs {taxonomy} taxonomy_name={taxonomy.taxonomy_name}/>
</section>

{/each}