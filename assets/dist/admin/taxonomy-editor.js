
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.43.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

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

    const settingsInfoset = createInfoSet();

    /* src/Switch.svelte generated by Svelte v3.43.1 */

    const file$4 = "src/Switch.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (128:8) {#each values as buttonvalue}
    function create_each_block$2(ctx) {
    	let input;
    	let input_checked_value;
    	let input_value_value;
    	let input_id_value;
    	let t0;
    	let label;
    	let t1_value = /*buttonvalue*/ ctx[4].text + "";
    	let t1;
    	let label_for_value;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = text(t1_value);
    			attr_dev(input, "type", "radio");

    			input.checked = input_checked_value = /*buttonvalue*/ ctx[4].value == /*value*/ ctx[3]
    			? 'checked'
    			: '';

    			input.value = input_value_value = /*buttonvalue*/ ctx[4].value;
    			attr_dev(input, "name", /*name*/ ctx[0]);
    			attr_dev(input, "id", input_id_value = "" + (/*id*/ ctx[1] + "-" + /*buttonvalue*/ ctx[4].text.toLowerCase()));
    			attr_dev(input, "class", "svelte-3pt7fl");
    			add_location(input, file$4, 128, 12, 2439);
    			attr_dev(label, "for", label_for_value = "" + (/*id*/ ctx[1] + "-" + /*buttonvalue*/ ctx[4].text.toLowerCase()));
    			attr_dev(label, "class", "svelte-3pt7fl");
    			add_location(label, file$4, 129, 12, 2612);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, label, anchor);
    			append_dev(label, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*values, value*/ 12 && input_checked_value !== (input_checked_value = /*buttonvalue*/ ctx[4].value == /*value*/ ctx[3]
    			? 'checked'
    			: '')) {
    				prop_dev(input, "checked", input_checked_value);
    			}

    			if (dirty & /*values*/ 4 && input_value_value !== (input_value_value = /*buttonvalue*/ ctx[4].value)) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty & /*name*/ 1) {
    				attr_dev(input, "name", /*name*/ ctx[0]);
    			}

    			if (dirty & /*id, values*/ 6 && input_id_value !== (input_id_value = "" + (/*id*/ ctx[1] + "-" + /*buttonvalue*/ ctx[4].text.toLowerCase()))) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*values*/ 4 && t1_value !== (t1_value = /*buttonvalue*/ ctx[4].text + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*id, values*/ 6 && label_for_value !== (label_for_value = "" + (/*id*/ ctx[1] + "-" + /*buttonvalue*/ ctx[4].text.toLowerCase()))) {
    				attr_dev(label, "for", label_for_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(label);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(128:8) {#each values as buttonvalue}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let span1;
    	let span0;
    	let each_value = /*values*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			span1 = element("span");
    			span0 = element("span");
    			attr_dev(span0, "class", "toggle-inside svelte-3pt7fl");
    			add_location(span0, file$4, 132, 12, 2758);
    			attr_dev(span1, "class", "toggle-outside svelte-3pt7fl");
    			add_location(span1, file$4, 131, 8, 2716);
    			attr_dev(div0, "class", "switch switch--horizontal switch--no-label svelte-3pt7fl");
    			add_location(div0, file$4, 126, 4, 2332);
    			attr_dev(div1, "class", "switch-holder svelte-3pt7fl");
    			add_location(div1, file$4, 125, 0, 2300);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div0, t);
    			append_dev(div0, span1);
    			append_dev(span1, span0);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*id, values, value, name*/ 15) {
    				each_value = /*values*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Switch', slots, []);
    	let { name } = $$props;
    	let { id } = $$props;
    	let { values } = $$props;
    	let { value } = $$props;
    	const writable_props = ['name', 'id', 'values', 'value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Switch> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('values' in $$props) $$invalidate(2, values = $$props.values);
    		if ('value' in $$props) $$invalidate(3, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ name, id, values, value });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('values' in $$props) $$invalidate(2, values = $$props.values);
    		if ('value' in $$props) $$invalidate(3, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, id, values, value];
    }

    class Switch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { name: 0, id: 1, values: 2, value: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Switch",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<Switch> was created without expected prop 'name'");
    		}

    		if (/*id*/ ctx[1] === undefined && !('id' in props)) {
    			console.warn("<Switch> was created without expected prop 'id'");
    		}

    		if (/*values*/ ctx[2] === undefined && !('values' in props)) {
    			console.warn("<Switch> was created without expected prop 'values'");
    		}

    		if (/*value*/ ctx[3] === undefined && !('value' in props)) {
    			console.warn("<Switch> was created without expected prop 'value'");
    		}
    	}

    	get name() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get values() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set values(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Gerneral.svelte generated by Svelte v3.43.1 */

    const { console: console_1$1 } = globals;
    const file$3 = "src/Gerneral.svelte";

    function create_fragment$4(ctx) {
    	let h1;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("are you a ");
    			t1 = text(/*taxonomy_name*/ ctx[0]);
    			add_location(h1, file$3, 6, 0, 89);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*taxonomy_name*/ 1) set_data_dev(t1, /*taxonomy_name*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Gerneral', slots, []);
    	let { taxonomy_name } = $$props;
    	console.log('col', taxonomy_name);
    	const writable_props = ['taxonomy_name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Gerneral> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('taxonomy_name' in $$props) $$invalidate(0, taxonomy_name = $$props.taxonomy_name);
    	};

    	$$self.$capture_state = () => ({ taxonomy_name });

    	$$self.$inject_state = $$props => {
    		if ('taxonomy_name' in $$props) $$invalidate(0, taxonomy_name = $$props.taxonomy_name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [taxonomy_name];
    }

    class Gerneral extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { taxonomy_name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gerneral",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*taxonomy_name*/ ctx[0] === undefined && !('taxonomy_name' in props)) {
    			console_1$1.warn("<Gerneral> was created without expected prop 'taxonomy_name'");
    		}
    	}

    	get taxonomy_name() {
    		throw new Error("<Gerneral>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set taxonomy_name(value) {
    		throw new Error("<Gerneral>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Filters.svelte generated by Svelte v3.43.1 */

    function create_fragment$3(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Filters', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Filters> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Filters extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Filters",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/ColFields.svelte generated by Svelte v3.43.1 */

    const { console: console_1 } = globals;
    const file$2 = "src/ColFields.svelte";

    function create_fragment$2(ctx) {
    	let h2;
    	let t;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = text(/*taxonomy_name*/ ctx[0]);
    			add_location(h2, file$2, 5, 0, 88);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*taxonomy_name*/ 1) set_data_dev(t, /*taxonomy_name*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ColFields', slots, []);
    	let { taxonomy_name } = $$props;
    	console.log('col', taxonomy_name);
    	const writable_props = ['taxonomy_name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<ColFields> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('taxonomy_name' in $$props) $$invalidate(0, taxonomy_name = $$props.taxonomy_name);
    	};

    	$$self.$capture_state = () => ({ taxonomy_name });

    	$$self.$inject_state = $$props => {
    		if ('taxonomy_name' in $$props) $$invalidate(0, taxonomy_name = $$props.taxonomy_name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [taxonomy_name];
    }

    class ColFields extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { taxonomy_name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ColFields",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*taxonomy_name*/ ctx[0] === undefined && !('taxonomy_name' in props)) {
    			console_1.warn("<ColFields> was created without expected prop 'taxonomy_name'");
    		}
    	}

    	get taxonomy_name() {
    		throw new Error("<ColFields>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set taxonomy_name(value) {
    		throw new Error("<ColFields>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Tabs.svelte generated by Svelte v3.43.1 */
    const file$1 = "src/Tabs.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (48:1) {#each taxonomy.tabs as tab , i}
    function create_each_block_1(ctx) {
    	let li;
    	let a;
    	let t_value = /*tab*/ ctx[3].name + "";
    	let t;
    	let a_class_value;
    	let a_data_tab_value;
    	let a_href_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "class", a_class_value = "" + ((/*i*/ ctx[5] == 0 ? "selected" : '') + " " + /*taxonomy_name*/ ctx[1] + " svelte-1ky2zyl"));
    			attr_dev(a, "data-tab", a_data_tab_value = "" + (/*taxonomy_name*/ ctx[1] + "-" + /*tab*/ ctx[3].type));
    			attr_dev(a, "href", a_href_value = "#" + /*taxonomy_name*/ ctx[1] + "-" + /*tab*/ ctx[3].type);
    			add_location(a, file$1, 48, 5, 1225);
    			attr_dev(li, "class", "svelte-1ky2zyl");
    			add_location(li, file$1, 48, 1, 1221);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*changeTab*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*taxonomy*/ 1 && t_value !== (t_value = /*tab*/ ctx[3].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*taxonomy_name*/ 2 && a_class_value !== (a_class_value = "" + ((/*i*/ ctx[5] == 0 ? "selected" : '') + " " + /*taxonomy_name*/ ctx[1] + " svelte-1ky2zyl"))) {
    				attr_dev(a, "class", a_class_value);
    			}

    			if (dirty & /*taxonomy_name, taxonomy*/ 3 && a_data_tab_value !== (a_data_tab_value = "" + (/*taxonomy_name*/ ctx[1] + "-" + /*tab*/ ctx[3].type))) {
    				attr_dev(a, "data-tab", a_data_tab_value);
    			}

    			if (dirty & /*taxonomy_name, taxonomy*/ 3 && a_href_value !== (a_href_value = "#" + /*taxonomy_name*/ ctx[1] + "-" + /*tab*/ ctx[3].type)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(48:1) {#each taxonomy.tabs as tab , i}",
    		ctx
    	});

    	return block;
    }

    // (61:40) 
    function create_if_block_2(ctx) {
    	let filters;
    	let current;

    	filters = new Filters({
    			props: { taxonomy_name: /*taxonomy_name*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(filters.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(filters, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const filters_changes = {};
    			if (dirty & /*taxonomy_name*/ 2) filters_changes.taxonomy_name = /*taxonomy_name*/ ctx[1];
    			filters.$set(filters_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filters.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filters.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(filters, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(61:40) ",
    		ctx
    	});

    	return block;
    }

    // (59:43) 
    function create_if_block_1(ctx) {
    	let colfields;
    	let current;

    	colfields = new ColFields({
    			props: { taxonomy_name: /*taxonomy_name*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(colfields.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(colfields, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const colfields_changes = {};
    			if (dirty & /*taxonomy_name*/ 2) colfields_changes.taxonomy_name = /*taxonomy_name*/ ctx[1];
    			colfields.$set(colfields_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(colfields.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(colfields.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(colfields, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(59:43) ",
    		ctx
    	});

    	return block;
    }

    // (56:2) {#if tab.type == 'general'}
    function create_if_block(ctx) {
    	let h4;
    	let t1;
    	let general;
    	let current;

    	general = new Gerneral({
    			props: { taxonomy_name: /*taxonomy_name*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "doign general";
    			t1 = space();
    			create_component(general.$$.fragment);
    			add_location(h4, file$1, 56, 12, 1637);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(general, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const general_changes = {};
    			if (dirty & /*taxonomy_name*/ 2) general_changes.taxonomy_name = /*taxonomy_name*/ ctx[1];
    			general.$set(general_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(general.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(general.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			destroy_component(general, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(56:2) {#if tab.type == 'general'}",
    		ctx
    	});

    	return block;
    }

    // (52:0) {#each taxonomy.tabs as tab, i}
    function create_each_block$1(ctx) {
    	let div;
    	let h2;
    	let t0_value = /*tab*/ ctx[3].name + "";
    	let t0;
    	let t1;
    	let h3;
    	let t2_value = /*tab*/ ctx[3].type + "";
    	let t2;
    	let t3;
    	let current_block_type_index;
    	let if_block;
    	let t4;
    	let div_class_value;
    	let div_id_value;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*tab*/ ctx[3].type == 'general') return 0;
    		if (/*tab*/ ctx[3].type == 'col_fields') return 1;
    		if (/*tab*/ ctx[3].type == 'filters') return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			h3 = element("h3");
    			t2 = text(t2_value);
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			add_location(h2, file$1, 53, 2, 1547);
    			add_location(h3, file$1, 54, 8, 1575);
    			attr_dev(div, "class", div_class_value = "area " + /*taxonomy_name*/ ctx[1] + " svelte-1ky2zyl");
    			attr_dev(div, "style", /*i*/ ctx[5] > 0 ? "display:none" : '');
    			attr_dev(div, "id", div_id_value = "" + (/*taxonomy_name*/ ctx[1] + "-" + /*tab*/ ctx[3].type));
    			add_location(div, file$1, 52, 1, 1443);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);
    			append_dev(div, h3);
    			append_dev(h3, t2);
    			append_dev(div, t3);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			append_dev(div, t4);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*taxonomy*/ 1) && t0_value !== (t0_value = /*tab*/ ctx[3].name + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*taxonomy*/ 1) && t2_value !== (t2_value = /*tab*/ ctx[3].type + "")) set_data_dev(t2, t2_value);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(div, t4);
    				} else {
    					if_block = null;
    				}
    			}

    			if (!current || dirty & /*taxonomy_name*/ 2 && div_class_value !== (div_class_value = "area " + /*taxonomy_name*/ ctx[1] + " svelte-1ky2zyl")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*taxonomy_name, taxonomy*/ 3 && div_id_value !== (div_id_value = "" + (/*taxonomy_name*/ ctx[1] + "-" + /*tab*/ ctx[3].type))) {
    				attr_dev(div, "id", div_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(52:0) {#each taxonomy.tabs as tab, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let ul;
    	let t;
    	let each1_anchor;
    	let current;
    	let each_value_1 = /*taxonomy*/ ctx[0].tabs;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*taxonomy*/ ctx[0].tabs;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each1_anchor = empty();
    			attr_dev(ul, "class", "tabs svelte-1ky2zyl");
    			add_location(ul, file$1, 46, 0, 1168);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul, null);
    			}

    			insert_dev(target, t, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*taxonomy_name, taxonomy, changeTab*/ 7) {
    				each_value_1 = /*taxonomy*/ ctx[0].tabs;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*taxonomy_name, taxonomy*/ 3) {
    				each_value = /*taxonomy*/ ctx[0].tabs;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each1_anchor.parentNode, each1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tabs', slots, []);
    	let { taxonomy } = $$props;
    	let { taxonomy_name } = $$props;

    	function changeTab(event) {
    		event.preventDefault();

    		Array.prototype.slice.call(document.querySelectorAll('.area.' + taxonomy_name)).map(elm => {
    			elm.style.display = 'none';
    		});

    		document.getElementById(event.target.dataset.tab).style.display = 'block';

    		Array.prototype.slice.call(document.querySelectorAll('a.' + taxonomy_name)).map(elm => {
    			elm.classList.remove('selected');
    		});

    		event.target.classList.add('selected');
    	}

    	const writable_props = ['taxonomy', 'taxonomy_name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('taxonomy' in $$props) $$invalidate(0, taxonomy = $$props.taxonomy);
    		if ('taxonomy_name' in $$props) $$invalidate(1, taxonomy_name = $$props.taxonomy_name);
    	};

    	$$self.$capture_state = () => ({
    		settingsInfoset,
    		General: Gerneral,
    		Filters,
    		ColFields,
    		taxonomy,
    		taxonomy_name,
    		changeTab
    	});

    	$$self.$inject_state = $$props => {
    		if ('taxonomy' in $$props) $$invalidate(0, taxonomy = $$props.taxonomy);
    		if ('taxonomy_name' in $$props) $$invalidate(1, taxonomy_name = $$props.taxonomy_name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [taxonomy, taxonomy_name, changeTab];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { taxonomy: 0, taxonomy_name: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*taxonomy*/ ctx[0] === undefined && !('taxonomy' in props)) {
    			console.warn("<Tabs> was created without expected prop 'taxonomy'");
    		}

    		if (/*taxonomy_name*/ ctx[1] === undefined && !('taxonomy_name' in props)) {
    			console.warn("<Tabs> was created without expected prop 'taxonomy_name'");
    		}
    	}

    	get taxonomy() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set taxonomy(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get taxonomy_name() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set taxonomy_name(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.43.1 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (33:0) {#each $settingsInfoset as taxonomy}
    function create_each_block(ctx) {
    	let section;
    	let h1;
    	let raw_value = /*taxonomy*/ ctx[3].taxonomy_title + "";
    	let t0;
    	let switch_1;
    	let t1;
    	let tabs;
    	let t2;
    	let current;

    	switch_1 = new Switch({
    			props: {
    				value: /*taxonomy*/ ctx[3].use,
    				values: /*yesno*/ ctx[1].values,
    				name: /*taxonomy*/ ctx[3].taxonomy_name,
    				id: /*taxonomy*/ ctx[3].taxonomy_name
    			},
    			$$inline: true
    		});

    	tabs = new Tabs({
    			props: {
    				taxonomy: /*taxonomy*/ ctx[3],
    				taxonomy_name: /*taxonomy*/ ctx[3].taxonomy_name
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			h1 = element("h1");
    			t0 = space();
    			create_component(switch_1.$$.fragment);
    			t1 = space();
    			create_component(tabs.$$.fragment);
    			t2 = space();
    			attr_dev(h1, "class", "svelte-ps8m3q");
    			add_location(h1, file, 34, 0, 464);
    			attr_dev(section, "class", "svelte-ps8m3q");
    			add_location(section, file, 33, 0, 454);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h1);
    			h1.innerHTML = raw_value;
    			append_dev(section, t0);
    			mount_component(switch_1, section, null);
    			append_dev(section, t1);
    			mount_component(tabs, section, null);
    			append_dev(section, t2);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*$settingsInfoset*/ 1) && raw_value !== (raw_value = /*taxonomy*/ ctx[3].taxonomy_title + "")) h1.innerHTML = raw_value;			const switch_1_changes = {};
    			if (dirty & /*$settingsInfoset*/ 1) switch_1_changes.value = /*taxonomy*/ ctx[3].use;
    			if (dirty & /*$settingsInfoset*/ 1) switch_1_changes.name = /*taxonomy*/ ctx[3].taxonomy_name;
    			if (dirty & /*$settingsInfoset*/ 1) switch_1_changes.id = /*taxonomy*/ ctx[3].taxonomy_name;
    			switch_1.$set(switch_1_changes);
    			const tabs_changes = {};
    			if (dirty & /*$settingsInfoset*/ 1) tabs_changes.taxonomy = /*taxonomy*/ ctx[3];
    			if (dirty & /*$settingsInfoset*/ 1) tabs_changes.taxonomy_name = /*taxonomy*/ ctx[3].taxonomy_name;
    			tabs.$set(tabs_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(switch_1.$$.fragment, local);
    			transition_in(tabs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(switch_1.$$.fragment, local);
    			transition_out(tabs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(switch_1);
    			destroy_component(tabs);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(33:0) {#each $settingsInfoset as taxonomy}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*$settingsInfoset*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$settingsInfoset, yesno*/ 3) {
    				each_value = /*$settingsInfoset*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $settingsInfoset;
    	validate_store(settingsInfoset, 'settingsInfoset');
    	component_subscribe($$self, settingsInfoset, $$value => $$invalidate(0, $settingsInfoset = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { infoset } = $$props;
    	settingsInfoset.set(infoset);

    	let yesno = {
    		values: [{ value: 1, text: 'Yes' }, { value: 0, text: 'No' }]
    	};

    	const writable_props = ['infoset'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('infoset' in $$props) $$invalidate(2, infoset = $$props.infoset);
    	};

    	$$self.$capture_state = () => ({
    		settingsInfoset,
    		Switch,
    		Tabs,
    		infoset,
    		yesno,
    		$settingsInfoset
    	});

    	$$self.$inject_state = $$props => {
    		if ('infoset' in $$props) $$invalidate(2, infoset = $$props.infoset);
    		if ('yesno' in $$props) $$invalidate(1, yesno = $$props.yesno);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$settingsInfoset, yesno, infoset];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { infoset: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*infoset*/ ctx[2] === undefined && !('infoset' in props)) {
    			console.warn("<App> was created without expected prop 'infoset'");
    		}
    	}

    	get infoset() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set infoset(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.getElementById('taxonomy-editor'),
    	props: {
    		infoset : taxonomyinfoset,
    		settings : settings
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
