<script>
    import settingsInfoset from "./modules/customstore.js";
    import General from "./Gerneral.svelte";
    import Filters from "./Filters.svelte";
    import ColFields from "./ColFields.svelte";

    export let taxonomy;
    export let taxonomy_name;
    

    function changeTab(event) {
        event.preventDefault();
        Array.prototype.slice.call(document.querySelectorAll('.area.'+taxonomy_name)).map(elm => {
            elm.style.display = 'none';
        });

        document.getElementById(event.target.dataset.tab).style.display = 'block';
        
        Array.prototype.slice.call(document.querySelectorAll('a.'+taxonomy_name)).map(elm => {
            elm.classList.remove('selected');
        });

        event.target.classList.add('selected');
    }
</script>
<style>
    .tabs {
		display:flex;
		list-style: none;
        margin: 0;
        padding: 0;
	}
	.tabs li {
		display: inline-block;
		border-top-left-radius: 7px;
		border-top-right-radius: 7px;
		border: solid 1px #ccc;
		line-height: 1.5rem;
		margin-right: 8px;
	} 
    li a {
        display:block;
        font-size:1.25rem;
        padding: 5px 8px;
    }
</style>
<ul class='tabs'>
	{#each taxonomy.tabs as tab , i}
	<li><a  class='{ i == 0 ? "selected":'' } {taxonomy_name}'  on:click={changeTab} data-tab="{taxonomy_name}-{tab.type}" href='#{taxonomy_name}-{tab.type}'>{tab.name}</a></li>
	{/each}
</ul>
{#each taxonomy.tabs as tab, i}
	<div class='area {taxonomy_name}' style={ i > 0 ? "display:none":''} id="{taxonomy_name}-{tab.type}">
		<h2>{tab.name}</h2>
        <h3>{tab.type}</h3>
		{#if tab.type == 'general'}
            <h4>doign general</h4>
            <General {taxonomy_name} />
        {:else if tab.type == 'col_fields'}
            <ColFields {taxonomy_name} />
        {:else if tab.type == 'filters'}  
            <Filters {taxonomy_name} />  
       {/if}
	</div>
{/each}