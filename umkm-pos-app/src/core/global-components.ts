import vueInit from './initiate'

// Import global components
const components = import.meta.glob('../components/*.vue', { eager: true });

Object.entries(components).forEach(([path, module]: [string, any]) => {
	const name = path
		.split('/')
		.pop()
		?.replace(/\.vue$/, '') ?? '';
  
  // register component globally
	vueInit.component(name, module.default);
});
