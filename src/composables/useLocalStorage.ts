import { ref, watch, type Ref } from 'vue';

export function useLocalStorage<T>(key: string, defaultValue: T): { value: Ref<T>; setValue: (newValue: T) => void; removeValue: () => void } {
    const storedValue = localStorage.getItem(key);
    const value = ref<T>(storedValue ? JSON.parse(storedValue) : defaultValue) as Ref<T>;

    watch(value, (newValue) => {
        localStorage.setItem(key, JSON.stringify(newValue));
    }, { deep: true });

    function setValue(newValue: T) {
        value.value = newValue;
    }

    function removeValue() {
        localStorage.removeItem(key);
        value.value = defaultValue;
    }

    return {
        value,
        setValue,
        removeValue
    };
}
