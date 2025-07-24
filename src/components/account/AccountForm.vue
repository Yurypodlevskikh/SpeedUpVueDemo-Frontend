<template>
    <div class="account-form">
        <div v-if="statusMessage" class="status-message">
            {{statusMessage}}
        </div>
        <form @submit.prevent="handleSubmit" class="form-actions">
            <div class="form-group">
                <InputSpeedUp inputType="text"
                              name="email"
                              v-model="formData.email"
                              :error="formErrors.email"
                              placeholderText="Email"
                              @update:modelValue="() => onFieldChange('email')" />

                <InputSpeedUp inputType="password"
                              name="password"
                              v-model="formData.password"
                              :error="formErrors.password"
                              placeholderText="Password"
                              @update:modelValue="() => onFieldChange('password')" />

                <!-- Password confirmation for registration only -->
                <InputSpeedUp v-if="isRegister"
                              inputType="password"
                              name="confirmPassword"
                              v-model="formData.confirmPassword"
                              :error="formErrors.confirmPassword"
                              placeholderText="Confirm Password"
                              @update:modelValue="() => onFieldChange('confirmPassword')" />

                <!-- Nickname for registration only -->
                <InputSpeedUp v-if="isRegister"
                              inputType="text"
                              name="nickname"
                              v-model="formData.nickname"
                              :error="formErrors.nickname"
                              placeholderText="Nickname"
                              @input="onFieldChange('nickname')"/>

                <!-- Hidden field audience -->
                <input type="hidden" v-model="formData.audience" />

                <ButtonSpeedUp :btnType="'submit'" title="Confirm">
                    <template #icon>
                        <IconPaperPlane :class="{ spinning: isSubmitting }" />
                    </template>
                </ButtonSpeedUp>
            </div>
        </form>
    </div>
    <div class="account-btn-footer">
        <ButtonSpeedUp @click="toggleForm"
                       :title="isRegister ? 'Already have an account?' : 'Create an account'">
            <template #icon>
                <component :is="isRegister ? IconLogin : SignUpIcon" />
            </template>
        </ButtonSpeedUp>

        <ButtonSpeedUp @click="forgotPassword"
                       title="Forgot Password">
            <template #icon>
                <KeyIcon />
            </template>
        </ButtonSpeedUp>
    </div>
</template>

<script setup>
    import { ref, nextTick } from 'vue';
    import { authenticateUser, registerUser } from '@/services/authService'
    import store from '@/store/store.js'
    import InputSpeedUp from '../InputSpeedUp.vue';
    import ButtonSpeedUp from '../ButtonSpeedUp.vue';
    import IconPaperPlane from '../icons/IconPaperPlane.vue';
    import SignUpIcon from '../icons/IconSignUp.vue';
    import KeyIcon from '../icons/IconKey.vue';
    import IconLogin from '../icons/IconLogin.vue';

    const isRegister = ref(false)
    const statusMessage = ref('')
    const isSubmitting = ref(false)

    const formData = ref({
        email: '',
        password: '',
        confirmPassword: '',
        nickname: '',
        audience: 'speedupapi.yurkinsson.com'
    })

    const formErrors = ref({
        email: '',
        password: '',
        confirmPassword: '',
        nickname: '',
    })

    function onFieldChange(fieldName) {
        // Vaiting for v-model to update
        nextTick(() => {
            validateField(fieldName)
        })
    }

    function validateField(fieldName) {
        const value = formData.value[fieldName]

        switch (fieldName) {
            case 'email':
                const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                const trimmedEmail = value.trim()
                if (!trimmedEmail) {
                    formErrors.value.email = 'Email is required.'
                } else if (!regexEmail.test(trimmedEmail)) {
                    formErrors.value.email = 'Invalid email format.'
                } else {
                    formErrors.value.email = ''
                }
                break
            case 'password':
                const trimmedPassword = value.trim()
                if (!trimmedPassword) {
                    formErrors.value.password = 'Password is required.'
                } else if (formData.value.password.length < 6) {
                    formErrors.value.password = 'Minimum 6 characters.'
                } else {
                    formErrors.value.password = ''
                }
                break
            case 'confirmPassword':
                if (value !== formData.value.password) {
                    formErrors.value.confirmPassword = 'Passwords do not match.'
                } else {
                    formErrors.value.confirmPassword = ''
                }
                break
            case 'nickname':
                const regexNickname = /^[A-Za-z0-9_]+$/
                if (!formData.value.nickname) {
                    formErrors.value.nickname = 'Nickname is required.'
                } else if (!regexNickname.test(formData.value.nickname)) {
                    formErrors.value.nickname = 'Only letters, numbers and underscore.'
                } else if (formData.value.nickname.length > 256) {
                    formErrors.value.nickname = 'Max 256 characters.'
                } else {
                    formErrors.value.nickname = ''
                }
                break
            default:
                break
        }
    }

    const hasErrors = () => Object.values(formErrors.value).some(error => error)

    const handleSubmit = async () => {

        const fieldsToValidate = ['email', 'password']

        if (isRegister.value) {
            fieldsToValidate.push('confirmPassword', 'nickname')
        }

        fieldsToValidate.forEach(validateField)

        if (hasErrors()) {
            if (import.meta.env.DEV) {
                console.log('❌ Fix errors.')
                Object.entries(formErrors.value).forEach(([key, value]) => {
                    if (value) console.warn(`• ${key}: ${value}`)
                })
            }
            
            return
        }

        isSubmitting.value = true

        try {
            if (isRegister.value) {
                const result = await registerUser(formData.value)

                if (result.success) {
                    // Show message and toggle form/swish to Login
                    statusMessage.value = result.message
                    isRegister.value = false
                    // Clear fields
                    formData.value.password = ''
                    formData.value.confirmPassword = ''
                    formData.value.nickname = ''
                } else {
                    formErrors.value.email = result.message
                }
            } else {
                const result = await authenticateUser(formData.value)

                if (result.success) {
                    //console.log('🎉 Logged in!', result)

                    // Change tabb to presets
                    store.commit('setActiveSettingsTab', 'presets')
                } else {
                    formErrors.value.email = result.message
                }
            }
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Submission error: ', error)
            }
        } finally {
            isSubmitting.value = false
        }
    }

    function toggleForm() {
        isRegister.value = !isRegister.value
        statusMessage.value = ''
    }

    function forgotPassword() {
        alert('Let\'s reset your password :-)')
    }
</script>

<style scoped>
    .spinning{
        animation: spin 1s linear infinite;
    }
    @keyframes spin{
        0%{transform: rotate(0deg);}
        100%{transform:rotate(360deg);}
    }
    .account-form {
        padding: .5rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    .status-message{
        background-color: #d1e7dd;
        color: #0f5132;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        text-align: center;
    }
    .form-group {
        display: flex;
        flex-direction: column;
        gap: .8rem;
        width: 100%;
    }
    .form-group input{
        width: 100%;
    }
    .form-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        justify-content: space-between;
        width: 100%;
    }
    .account-btn-footer {
        align-items: center;
        background-color: var(--color-btn-back);
        border: none;
        border-radius: 14px;
        display: flex;
        justify-content: space-around;
        text-align: center;
    }
</style>