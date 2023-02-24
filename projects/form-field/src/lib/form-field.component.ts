import { Component, forwardRef, Inject, Injector, Input } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormControlDirective,
  FormControlName,
  FormGroupDirective,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-form-field',
  templateUrl: 'form-field.component.html',
  styleUrls: ['form-field.component.sass'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => FormFieldComponent),
    },
  ],
})
export class FormFieldComponent<T> implements ControlValueAccessor {
  control!: FormControl;
  @Input() placeholder: string = '';
  @Input() title!: string;

  errorsMessage: any = {
    required: 'Campo obrigatório',
    minlength: 'Tamanho mínimo não atingido',
  };

  messageControl!: string | null;
  protected readonly destroy = new Subject<void>();

  constructor(@Inject(Injector) private injector: Injector) {}

  ngOnInit(): void {
    this.setComponentControl();
  }

  writeValue(value: T): void {
    this.onChange(value);
  }

  checkErrors() {
    if (this.control.errors)
      this.messageControl =
        this.errorsMessage[Object.keys(this.control.errors)[0]];
    else this.messageControl = null;
  }

  registerOnChange(fn: (value: T | null) => T): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  onChange = (value: T | null): T | null => value;

  onTouch = (): void => {};

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  private setComponentControl(): void {
    try {
      const formControl = this.injector.get(NgControl);
      switch (formControl.constructor) {
        case FormControlName: {
          this.control = this.injector
            .get(FormGroupDirective)
            .getControl(formControl as FormControlName);
          break;
        }
        default: {
          this.control = (formControl as FormControlDirective)
            .form as FormControl;
          break;
        }
      }
    } catch (error) {
      this.control = new FormControl();
    }
  }
}
