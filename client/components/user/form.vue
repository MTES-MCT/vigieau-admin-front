<script setup lang="ts">
import type { Ref } from 'vue';
import { email, helpers, required, requiredIf } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import type { User } from '~/dto/user.dto';
import { UserRole } from '~/dto/user.dto';
import { useAuthStore } from '~/stores/auth';

const props = defineProps<{
  user: User | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  createEdit: any;
}>();

const rolesAvailable = [];
const authStore = useAuthStore();
for (const ur in UserRole) {
  if (!(ur === 'mte' && authStore.user.role === 'departement')) {
    rolesAvailable.push({
      text: UserRole[ur],
      value: ur,
    });
  }
}

const formData = reactive({
  email: props.user ? props.user.email : null,
  firstName: props.user ? props.user.firstName : null,
  lastName: props.user ? props.user.lastName : null,
  role: props.user ? props.user.role : rolesAvailable.length > 1 ? null : rolesAvailable[0].value,
  roleDepartement: props.user ? props.user.roleDepartement : authStore.user.role === 'departement' ? authStore.user.roleDepartement : null,
  isNewUser: !props.user,
});
const errorMessage: Ref<string> = ref('');

const rules = computed(() => {
  return {
    email: {
      required: helpers.withMessage("L'email est obligatoire.", required),
      email: helpers.withMessage("L'email n'est pas valide.", email),
    },
    firstName: {},
    lastName: {},
    role: {
      required: helpers.withMessage('Le rôle est obligatoire.', required),
    },
    roleDepartement: {
      requiredIf: helpers.withMessage('Le département est obligatoire.', requiredIf(formData.role === 'departement')),
      regex: helpers.withMessage("Le département n'existe pas", helpers.regex(/^([0|2][1-9]|[1|3-8][0-9]|9[0-5]|97[1-4]|2[AB]|976)$/)),
    },
  };
});

const v$ = useVuelidate(rules, formData);

const computeErrorMessage = () => {
  errorMessage.value = v$.value.$errors.map((e) => e.$message).join(' ');
};

const submitForm = async () => {
  await v$.value.$validate();
  if (!v$.value.$error && !props.loading) {
    emit('createEdit', formData);
  } else {
    computeErrorMessage();
  }
};

defineExpose({
  submitForm,
});
</script>

<template>
  <form @submit.prevent="">
    <DsfrInputGroup :error-message="errorMessage" :valid-message="''">
      <DsfrInput
        id="email"
        v-model="formData.email"
        hint="Format attendu: nom@domaine.fr"
        label="Email"
        label-visible
        type="text"
        name="email"
        :disabled="loading || !formData.isNewUser"
        :required="true"
      />
      <div class="fr-mt-2w">
        <DsfrInput
          v-if="!formData.isNewUser"
          id="firstName"
          v-model="formData.firstName"
          label="Prénom"
          label-visible
          type="text"
          name="firstName"
          disabled
        />
      </div>
      <div class="fr-mt-2w">
        <DsfrInput
          v-if="!formData.isNewUser"
          id="lastName"
          v-model="formData.lastName"
          label="Nom"
          label-visible
          type="text"
          name="lastName"
          disabled
        />
      </div>
      <div class="fr-mt-2w">
        <DsfrSelect
          id="role"
          v-model="formData.role"
          :options="rolesAvailable"
          label="Rôle"
          label-visible
          type="text"
          name="role"
          :disabled="loading || authStore.user.role === 'departement'"
          required
        />
      </div>
      <div class="fr-mt-2w">
        <DsfrInput
          v-if="formData.role === 'departement'"
          id="roleDepartement"
          v-model="formData.roleDepartement"
          hint="Format attendu: 01, 2A, 976 ..."
          label="Département"
          label-visible
          type="text"
          name="roleDepartement"
          :disabled="loading || authStore.user.role === 'departement'"
          :required="true"
        />
      </div>
    </DsfrInputGroup>
  </form>
</template>
