<script>
	import Switch from "./Switch.svelte";
	import Tabs from "./Tabs.svelte";

	export let infoset;

	let yesno = {
		values : [{
			value: 1,
			text: 'Yes' 
		},
		{
			value: 0,
			text: 'No' 
		}
		],
	}

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
{#each infoset as taxonomy}
<section>
<h1>{@html taxonomy.taxonomy_title}</h1>
<Switch value={taxonomy.use} values={yesno.values} name={taxonomy.taxonomy_name} id={taxonomy.taxonomy_name} />
<Tabs {taxonomy} taxonomy_name={taxonomy.taxonomy_name}/>
</section>

{/each}