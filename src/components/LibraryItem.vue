<template>
  <div v-show="active" class="library-item-container" :id="'lib-item' + catIndex">
    <div class="library-item" :key="index" v-for="(elem, index) of signs" @click="selectSign(index)">
      <svg width="100%" :height="'beatHeight' in elem.signData ? elem.signData.beatHeight * minHeight + 2: height + 2" fill="white" class="library-sign-svg" :cat-index="catIndex" :index="index">
        <g :transform="'translate('+ offset + ',1)'">
          <g :transform="elem.signData.baseType == 'RelationshipBow' ? 'translate(-60,0)' : ''">
              <component :is="elem.signData.baseType" :isSelected="index == selected" :height="'beatHeight' in elem.signData ? elem.signData.beatHeight * minHeight : elem.height" :signData="elem.signData"/>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script>
/**
 * The LibraryItem component
 * @displayName Library Item
 */
export default {
  name: 'LibraryItem',
  inject: ["barHeight"],
  emits: ["expand", "emitSigns", "selectSign"],
  props: {
    active: Boolean,
    category: String,
    catIndex: Number,
    selected: Number,
    offset: Number,
  },
  data() {
    return {
      signs: [],
      height: 0, 
      baseHeight: 0,
    };
  },
  computed: {
    langStrings () {
      let lang = this.$store.state["language"];
      let json = require('@/assets/sign-category-loaders/' + this.category + '-' + lang + '.json');
      let obj = JSON.parse(JSON.stringify(json));
      return obj;
    },
    minHeight () {
      return this.barHeight() / this.$store.state["beatsPerBar"];
    }
  },
  watch: {
    active (value) {
      if (value) {
      for (let elem of document.getElementById("lib-item" + this.catIndex).getElementsByClassName("library-sign-svg")) {
      ["touchstart", "touchmove", "touchend"].forEach((et) => elem.addEventListener(et, this.ignoreTouch));
    }
      }
    }
  },
  mounted () {
    //load signs and add click functionality
    let json = require('@/assets/sign-category-loaders/' + this.category + '.json');
    let obj = JSON.parse(JSON.stringify(json));
    this.height = obj.catHeight;
    this.baseHeight = obj.baseHeight;
    let general = {};
    for (let [key,value] of Object.entries(obj.general[0])) {
        general[key] = value;
      }
    for (let index = 0; index < obj.signData.length; index++) {
      let newSign = {};
      newSign = Object.assign(newSign, general)
      newSign.signData = {};
      for (let [key,value] of Object.entries(obj.signData[index])) {
        newSign.signData[key] = value;
      }
      this.signs.push(newSign);

    }
    this.$emit("emitSigns", {catIndex: this.catIndex, signs: this.signs});
  },
  methods: {
    selectSign (index) {
      let nameElem = this.langStrings.names.find(elem => this.signs[index].signData.signType == elem.signType);
      this.$emit("selectSign", {catIndex: this.catIndex, name: nameElem.name, index: index, height: this.baseHeight, signData: this.signs[index].signData, updateSign: false});
    },
    /**
     * InteractJS workaround: touch events immediately end resize and drag events -> cancel them before that happens and implement scrolling elsewhere
     * @arg event the drag-move event
     */
    ignoreTouch (event) {
      if (event.cancelable) {
        event.preventDefault();
      } else {
        console.warn(`The following event couldn't be canceled:`);
        console.dir(event);
      }
    },
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
