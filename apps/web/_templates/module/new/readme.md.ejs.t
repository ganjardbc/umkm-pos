---
to: "src/modules/<%=h.changeCase.param(name)%>/README.md"
---

# Template Module

This module demonstrates a modular approach to managing state in a Vue 3 + Pinia application using external files for state, getters, and actions.

## Structure

```
stores/
  index.ts        # Main Pinia store configuration
  state.ts        # State definition
  getters.ts      # Getters definition
  actions.ts      # Actions definition
```

## Usage

1. **Define State**
   - Add your state properties in `state.ts` as a function returning an object.
2. **Define Getters**
   - Add your getter functions in `getters.ts` as an object.
3. **Define Actions**
   - Add your action functions in `actions.ts` as an object.
4. **Configure Store**
   - The main store in `index.ts` imports and uses these external definitions.

## Notes
- This pattern helps keep your store logic organized and maintainable.
- You can extend this template for other modules in your application.
