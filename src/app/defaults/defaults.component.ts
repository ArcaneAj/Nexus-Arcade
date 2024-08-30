import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { InputNumberComponent } from '../input-number/input-number.component';
import { SettingsService } from '../services/settings.service';
import { BaseComponent } from '../base.component';
import {
    BoolSetting,
    NumberSetting,
    Setting,
    StringSetting,
} from '../models/setting.model';
import {
    MatButtonToggleChange,
    MatButtonToggleModule,
} from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-defaults',
    standalone: true,
    imports: [
        // Angular material
        FormsModule,
        MatCheckboxModule,
        InputNumberComponent,
        MatButtonToggleModule,
        MatIconModule,
        MatTooltipModule,
    ],
    templateUrl: './defaults.component.html',
    styleUrl: './defaults.component.scss',
})
export class DefaultsComponent extends BaseComponent {
    public onlyCrafted: BoolSetting = {
        name: 'onlyCrafted',
        value: false,
    };
    public minLevel: NumberSetting = {
        name: 'minLevel',
        value: 0,
    };
    public maxLevel: NumberSetting = {
        name: 'maxLevel',
        value: 999,
    };
    public sortAscending: BoolSetting = {
        name: 'sortAscending',
        value: false,
    };
    public sortCrafted: BoolSetting = {
        name: 'sortCrafted',
        value: true,
    };
    public sortCriteria: StringSetting = {
        name: 'sortCriteria',
        value: 'profit',
    };

    public defaultsChanged = output<Setting[]>();

    constructor(private settings: SettingsService) {
        super();
        this.subscription.add(
            this.settings.Settings().subscribe((x) => {
                for (const setting of x) {
                    if (setting.name in this) {
                        this.updateSetting(setting);
                    }
                }
            })
        );
    }

    private updateSetting(setting: Setting) {
        this[setting.name as keyof typeof this] = setting as any;
    }

    settingChanged() {
        const defaults: Setting[] = [
            this.onlyCrafted,
            this.minLevel,
            this.maxLevel,
            this.sortAscending,
            this.sortCriteria,
            this.sortCrafted,
        ];
        this.defaultsChanged.emit(defaults);
    }

    sortOrderChanged(event: MatButtonToggleChange) {
        this.sortAscending.value = event.value === 'true';
        this.settingChanged();
    }

    sortCriteriaChanged(event: MatButtonToggleChange) {
        this.sortCriteria.value = event.value;
        if (this.sortCriteria.value !== 'profit') {
            this.sortCrafted.value = true;
        }

        this.settingChanged();
    }

    sortPropertyChanged(event: MatButtonToggleChange) {
        this.sortCrafted.value = event.value === 'true';
        this.settingChanged();
    }
}
