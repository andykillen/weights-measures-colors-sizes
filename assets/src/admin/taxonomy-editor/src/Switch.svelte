<script>
    export let name;
    export let id;
    export let values;
    export let value;
</script>
<!-- <style lang="scss">
@import './styles/theme';

label {
    color:$color;
}
</style> -->
<style>
 .switch-holder {
     position: absolute;
     left: 0;
     top:0;
 }

.switch {
  margin: 4rem auto;
}
/* main styles */
.switch {
  width: 24rem;
  position: relative;
}
.switch input {
  position: absolute;
  top: 0;
  z-index: 2;
  opacity: 0;
  cursor: pointer;
}
.switch input:checked {
  z-index: 1;
}
.switch input:checked + label {
  opacity: 1;
  cursor: default;
}
.switch input:not(:checked) + label:hover {
  opacity: 0.5;
}
.switch label {
  color: #fff;
  opacity: 0.33;
  transition: opacity 0.25s ease;
  cursor: pointer;
}
.switch .toggle-outside {
  height: 100%;
  border-radius: 2rem;
  padding: 0.25rem;
  overflow: hidden;
  transition: 0.25s ease all;
}
.switch .toggle-inside {
  border-radius: 5rem;
  background: #4a4a4a;
  position: absolute;
  transition: 0.25s ease all;
}
.switch--horizontal {
  width: 18rem;
  height: 3rem;
  margin: 0 auto;
  font-size: 0;
  margin-bottom: 1rem;
}
.switch--horizontal input {
  height: 3rem;
  width: 6rem;
  left: 6rem;
  margin: 0;
}
.switch--horizontal label {
  font-size: 1.5rem;
  line-height: 3rem;
  display: inline-block;
  width: 6rem;
  height: 100%;
  margin: 0;
  text-align: center;
}
.switch--horizontal label:last-of-type {
  margin-left: 6rem;
}
.switch--horizontal .toggle-outside {
  background: #fff;
  position: absolute;
  width: 6rem;
  left: 6rem;
}
.switch--horizontal .toggle-inside {
  height: 2.5rem;
  width: 2.5rem;
}
.switch--horizontal input:checked ~ .toggle-outside .toggle-inside {
  left: 0.25rem;
}
.switch--horizontal input ~ input:checked ~ .toggle-outside .toggle-inside {
  left: 3.25rem;
}
.switch--no-label label {
  width: 0;
  height: 0;
  visibility: hidden;
  overflow: hidden;
}
.switch--no-label input:checked ~ .toggle-outside .toggle-inside {
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(0,0,0,0.2);
}
.switch--no-label input ~ input:checked ~ .toggle-outside {
  background: #fff;
}
.switch--no-label input ~ input:checked ~ .toggle-outside .toggle-inside {
  background: #2ecc71;
}
.switch--no-label.switch--horizontal {
  width: 6rem;
}
.switch--no-label.switch--horizontal input,
.switch--no-label.switch--horizontal .toggle-outside {
  left: 0;
}




</style>
<div class='switch-holder'>
    <div class='switch switch--horizontal switch--no-label'>
        {#each values as buttonvalue}
            <input type='radio' checked={ buttonvalue.value == value ? 'checked' : ''} value={buttonvalue.value} name='{name}' id='{id}-{buttonvalue.text.toLowerCase()}' />
            <label for='{id}-{ buttonvalue.text.toLowerCase() }'>{buttonvalue.text}</label>
        {/each}
        <span class="toggle-outside">
            <span class="toggle-inside"></span>
        </span>
    </div>
</div>