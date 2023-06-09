import {DefaultResponseType} from "../../../types/default-response.type";
import {MatSnackBar} from "@angular/material/snack-bar";

export class SnackbarErrorUtil {
  static showErrorMessageIfErrorAndThrowError(data: DefaultResponseType, _snackBar: MatSnackBar): void {
    if (data.error) {
      const message = (data as DefaultResponseType).message;
      _snackBar.open(message);
      throw new Error(message);
    }
  }
}
