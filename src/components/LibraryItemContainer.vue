<template>
  <div class="library-category-container" ref="container" :id="'library-' + category">
    <div class="library-category-name" @click="expand">
      <div class="center-vertically">
        <p class="context-item-text">{{langStrings.catName}}</p>
      </div>
      <div class="center-vertically context-item-interact-box">
          <img class="context-item-interact-img smaller" :class="active ? 'turned' : 'unturned'" src="@/assets/images/sign-categories/triangle-right.svg" alt="triangle"/>
      </div>
    </div>
    <LibraryItem v-show="active || isTutHighlight" :active="active || isTutHighlight" :category="category" :catIndex="catIndex" :selected="selected" :offset="itemOffset" @emitSigns="emitSigns" @selectSign="selectSign"/>
  </div>
</template>

<script>
/**
 * The Library Item Container component
 * @emits expand requests category being expanded
 * @emits emitSigns emit loaded signs to the library
 * @emits selectSign request sign beeing selected
 * @displayName Library Item Container
 */
export default {
  name: 'LibraryItemContainer',
  emits: ["expand", "emitSigns", "selectSign"],
  props: {
    active: Boolean,
    category: String,
    catIndex: Number,
    selected: Number,
  },
  data() {
    return {
      itemOffset: 0,
      isTutHighlight: false,
    };
  },
  computed: {
    /**
     * loads the translation of the category signs
     */
    langStrings () {
      let lang = this.$store.state["language"];
      let json = require('@/assets/sign-category-loaders/' + this.category + '-' + lang + '.json');
      let obj = JSON.parse(JSON.stringify(json));
      return obj;
    },
  },
  mounted () {
    // set the inner offset of the item
    this.itemOffset = this.getOffset();
    // setting an observer that opens the category when an introduction highlights it
     this.observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        const newValue = m.target.getAttribute(m.attributeName);
        this.$nextTick(() => {
          this.onClassChange(newValue, m.oldValue);
        });
      }
    });

    //the observer checks the class list of the container of the category
    this.observer.observe(this.$refs.container, {
      attributes: true,
      attributeOldValue : true,
      attributeFilter: ['class'],
    });
  },
  beforeUnmount () {
    // disconnecting the observer on unmount
    this.observer.disconnect();
  },
  methods: {
    /**
     * expands the category
     */
    expand () {
      this.$emit("expand", this.catIndex);
    },
    /**
     * @returns the offset for the inner category
     */
    getOffset() {
        return this.$refs.container.offsetWidth / 6 - 20;
    },
    /**
     * emits the signs in the category to the library
     */
    emitSigns (data) {
      this.$emit("emitSigns", data);
    },
    /**
     * requests the selection of a sign
     */
    selectSign (data) {
      this.$emit("selectSign", data);
    },
    /**
     * when an introduction highlights 
     */
    onClassChange(classAttrValue) {
      const classList = classAttrValue.split(' ');
      if (classList.includes('tut-highlight')) {
        this.isTutHighlight = true;
      } else {
        this.isTutHighlight = false;
      }
    }
  },
}
</script>

<style scoped>
  .turned {
    transform: rotate(90deg);
  }

  .unturned {
    transform: rotate(-90deg);
  }

  .selected {
    border: 1px solid blue;
  }
  
</style>
