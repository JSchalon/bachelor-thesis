<template>
  <g>
    <rect class="no-save" fill="white" opacity="0" x="0" y="0" :width="signWidth" :height="height" :signID="id"/>
    <path
      class="draggable actual-sign"  
      stroke="black"
      :class="{active: isSelected}"  
      :stroke-width="isSelected ? borderWidth + 1: borderWidth" 
      :signID="id" 
      :d=" 'M ' + (signWidth /2) + ', 5 V ' + (height - 5)"
    />
    <g :transform="signData.signType == 'circularRight' ? 'scale(-1,1) translate(-40, 0)' : ''">
      <path class="draggable actual-sign"  :class="{active: isSelected}" stroke="black" :stroke-width="isSelected ? borderWidth + 1: borderWidth" :signID="id" :d="pathHead(true)"/>
      <path class="draggable actual-sign"  :class="{active: isSelected}" stroke="black" :stroke-width="isSelected ? borderWidth + 1: borderWidth" :signID="id" :d="pathHead(false)" />
    </g>
  </g>
</template>

<script>


/**
 * The general path sign component
 * @displayName Path Sign
 */
export default {
  name: 'PathSign',
  props: {
    isSelected: Boolean,
    id: Number,
    signData: Object,
    height: Number,
  },
  inject: ["signWidth","borderWidth"],
  methods: {
    /**
     * calculates the path head/tail based on the signType
     * @param isTop boolean. used to determine the vertical position
     */
    pathHead (isTop) {
      let yPos = 5;
      if (!isTop) { // tail -> move position to the bottom of the sign
        yPos = this.height - 5;
      }
      let path = "M " + (this.signWidth/2 - 15) +"," + yPos + " H " + (this.signWidth/2 + 15); // straight path -> flat head
      if (this.signData.signType.includes("circular")) { // circular path -> slanted head
        path = "M " + (this.signWidth/2 - 15) +"," + (yPos - 5) + " L " + (this.signWidth/2 + 15) + "," + (yPos + 5);
      } else if (this.signData.signType == "any") { // any path -> curved head
        path = 
          "M " + (this.signWidth/2 - 15) +"," + yPos + 
          "Q" + (this.signWidth/2 - 7.5) + "," + (yPos - 10) + "," + (this.signWidth/2) + "," + yPos +
          "Q" + (this.signWidth/2 + 7.5) + "," + (yPos + 10) + "," + (this.signWidth/2 + 15) + "," + yPos;
      } 
      return path; 
    }
  },
}
</script>