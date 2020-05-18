export default class DateUtils {
	private constructor() {

	}

	public static display(seconds?: number): string {
		if(!seconds) return "";

		const secs = seconds % 60;
		seconds -= secs;
		seconds /= 60;
		const minutes = seconds % 60;
		seconds -= minutes;
		seconds /= 60;
		const hours = seconds;

		const _secs = secs >= 10 ? "" + secs : "0" + secs;
		const _minutes = minutes >= 10 ? "" + minutes : "0" + minutes;
		const _hours = hours >= 10 ? "" + hours : "0" + hours;
		return `${_hours}:${_minutes}:${_secs}`;
	}
}