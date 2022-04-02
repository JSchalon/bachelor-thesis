<template>
  <div class="modal" :class="modalActive ? 'is-active' : ''">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="box">
        <h1 class="title"><slot name="title">Confirm Creation of new Score</slot></h1>
        <p class="mb-4"><slot name="text">Creating a new score will delete any unsaved contents of the current score. This action is currently not reversible.</slot></p>
        <button class="button is-success" @click="$emit('confirm')"><slot name="confirm">Understood</slot></button>
        <button v-if="cancel" class="button ml-3" type="reset" @click="$emit('disableModal')"><slot name="deny">Cancel</slot></button>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * A generic confirmation modal with a title, a text, a confirm and a cancel button
 * Used to make sure a user understands the consequence an action might have
 * Change Text via slots
 * @displayName Confirmation Modal
 */
export default {
  name: 'ConfirmationModal',
  emits: ["disableModal", "confirm"],
  props: {
    modalActive: Boolean,
    cancel: {
      default: true,
      Boolean
    }
  },
  data() {
    return {
    };
  },
  computed: {

  },
  mounted () {
    
  },
  methods: {
    
  }
}
</script>
